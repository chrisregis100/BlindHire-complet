import { hash } from "starknet";

function toFeltString(value: string): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) throw new Error("Value cannot be empty.");
  return BigInt(normalizedValue).toString();
}

export function buildCommitHash(bidAmount: string, secret: string): string {
  const bidFelt = toFeltString(bidAmount);
  const secretFelt = toFeltString(secret);

  // Must match Cairo pedersen(bid_amount, secret) in the contract.
  return hash.computePedersenHash(bidFelt, secretFelt);
}
