import {
  AccountInterface,
  byteArray,
  Contract,
  RpcProvider,
  shortString,
} from "starknet";

import { blindHireAbi } from "@/lib/blindhire-abi";
import { JobView, RevealedBidView, WinnerView } from "@/lib/types";

const FALLBACK_RPC_URL = "https://starknet-sepolia-rpc.publicnode.com";

function getContractAddress(): string {
  const contractAddress = process.env.NEXT_PUBLIC_BLINDHIRE_CONTRACT_ADDRESS;
  if (!contractAddress)
    throw new Error("Missing NEXT_PUBLIC_BLINDHIRE_CONTRACT_ADDRESS.");
  return contractAddress;
}

export function getProvider(): RpcProvider {
  const nodeUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL ?? FALLBACK_RPC_URL;
  return new RpcProvider({ nodeUrl });
}

export function getReadContract(): Contract {
  return new Contract({
    abi: blindHireAbi,
    address: getContractAddress(),
    providerOrAccount: getProvider(),
  });
}

export function getWriteContract(account: AccountInterface): Contract {
  return new Contract({
    abi: blindHireAbi,
    address: getContractAddress(),
    providerOrAccount: account,
  });
}

function decodeJobDescription(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "data" in value) {
    try {
      return byteArray.stringFromByteArray(
        value as {
          data: string[];
          pending_word: string;
          pending_word_len: number;
        },
      );
    } catch {
      // fallback to array handling
    }
  }

  if (Array.isArray(value) && value.length > 0) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          try {
            return shortString.decodeShortString(item);
          } catch {
            return item;
          }
        }
        return String(item);
      })
      .join("");
  }

  return "";
}

function normalizeAddress(value: unknown): string {
  if (typeof value === "string") return value;
  return String(value ?? "");
}

function toBigInt(value: unknown): bigint {
  return BigInt(String(value));
}

function toNumber(value: unknown): number {
  return Number(String(value));
}

interface ContractJobResponse {
  client_address: unknown;
  job_description: unknown;
  commit_deadline: unknown;
  reveal_deadline: unknown;
  finalized: unknown;
}

function mapJobResponse(jobId: number, jobResponse: ContractJobResponse): JobView {
  return {
    jobId,
    clientAddress: normalizeAddress(jobResponse.client_address),
    jobDescription: decodeJobDescription(jobResponse.job_description),
    commitDeadline: toNumber(jobResponse.commit_deadline),
    revealDeadline: toNumber(jobResponse.reveal_deadline),
    finalized: Boolean(jobResponse.finalized),
  };
}

export async function fetchJobById(jobId: number): Promise<JobView> {
  const contract = getReadContract();
  const jobResponse = (await contract.get_job(jobId)) as ContractJobResponse;
  return mapJobResponse(jobId, jobResponse);
}

export async function fetchJobs(): Promise<JobView[]> {
  const contract = getReadContract();
  const jobCountResponse = await contract.get_job_count();
  const jobCount = toNumber(jobCountResponse);
  const jobs: JobView[] = [];

  for (let jobId = 0; jobId < jobCount; jobId += 1) {
    const jobResponse = (await contract.get_job(jobId)) as ContractJobResponse;
    jobs.push(mapJobResponse(jobId, jobResponse));
  }

  return jobs;
}

export async function fetchRevealedBids(
  jobId: number,
): Promise<RevealedBidView[]> {
  const contract = getReadContract();
  const countResponse = await contract.get_revealed_bid_count(jobId);
  const count = toNumber(countResponse);
  const bids: RevealedBidView[] = [];

  for (let index = 0; index < count; index += 1) {
    const bidResponse = await contract.get_revealed_bid_at(jobId, index);
    bids.push({
      freelancerAddress: normalizeAddress(bidResponse[0]),
      amount: toBigInt(bidResponse[1]),
    });
  }

  return bids;
}

export async function fetchWinner(jobId: number): Promise<WinnerView> {
  const contract = getReadContract();
  const winnerResponse = await contract.get_winner(jobId);

  return {
    hasWinner: Boolean(winnerResponse[0]),
    winnerAddress: normalizeAddress(winnerResponse[1]),
    winningAmount: toBigInt(winnerResponse[2]),
  };
}

export async function writeCreateJob(
  account: AccountInterface,
  description: string,
  commitDeadline: number,
  revealDeadline: number,
): Promise<string> {
  const contract = getWriteContract(account);
  // Pass string directly: Contract parser converts it to CairoByteArray (objects are rejected)
  const tx = await contract.create_job(
    description,
    commitDeadline,
    revealDeadline,
  );
  await account.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

export async function writeCommitBid(
  account: AccountInterface,
  jobId: number,
  commitHash: string,
): Promise<string> {
  const contract = getWriteContract(account);
  const tx = await contract.commit_bid(jobId, commitHash);
  await account.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

export async function writeRevealBid(
  account: AccountInterface,
  jobId: number,
  bidAmount: string,
  secret: string,
): Promise<string> {
  const contract = getWriteContract(account);
  const tx = await contract.reveal_bid(
    jobId,
    BigInt(bidAmount).toString(),
    BigInt(secret).toString(),
  );
  await account.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}

export async function writeFinalizeAuction(
  account: AccountInterface,
  jobId: number,
): Promise<string> {
  const contract = getWriteContract(account);
  const tx = await contract.finalize_auction(jobId);
  await account.waitForTransaction(tx.transaction_hash);
  return tx.transaction_hash;
}
