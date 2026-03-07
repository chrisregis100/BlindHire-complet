# BlindHire - Starknet MVP

BlindHire is a privacy-preserving freelance bidding marketplace built on Starknet.
It uses a commit-reveal sealed-bid flow so freelancers cannot see each other's prices during bidding.

## Architecture

### Why Commit-Reveal?

Public bids create destructive price competition. BlindHire prevents this by splitting bidding into two phases:

1. **Commit phase**: freelancer submits only `commit_hash = pedersen(bid_amount, secret)`.
2. **Reveal phase**: freelancer reveals `(bid_amount, secret)`.
3. Contract recomputes the hash and accepts only valid reveals.
4. After reveal deadline, contract finalizes winner as **lowest valid revealed bid**.

### Components

- `contracts/src/blindhire.cairo`: Cairo smart contract with job + sealed-bid auction logic.
- `frontend/`: Next.js dApp with wallet connect, create/commit/reveal/finalize/result screens.
- `contracts/tests/blindhire_test.cairo`: Starknet Foundry tests for the core rules.

## Project Structure

```text
BlindHire/
├─ contracts/
│  ├─ Scarb.toml
│  ├─ src/
│  │  ├─ lib.cairo
│  │  └─ blindhire.cairo
│  ├─ tests/
│  │  └─ blindhire_test.cairo
│  └─ scripts/
│     └─ deploy-sepolia.sh
└─ frontend/
   ├─ app/
   │  ├─ create-job/page.tsx
   │  ├─ submit-bid/page.tsx
   │  ├─ reveal-bid/page.tsx
   │  └─ job-result/page.tsx
   ├─ hooks/
   ├─ components/
   └─ lib/
```

## Smart Contract Rules Enforced

- No commits after `commit_deadline`.
- No reveals before `commit_deadline`.
- No reveals after `reveal_deadline`.
- Reveal accepted only if `pedersen(bid_amount, secret) == commit_hash`.
- One bid per freelancer per job.
- Winner selected as lowest revealed valid bid on `finalize_auction`.

## Prerequisites

- Node.js 20+
- npm 10+
- [Scarb](https://docs.swmansion.com/scarb/)
- [Starknet Foundry (`snforge`, `sncast`)](https://foundry-rs.github.io/starknet-foundry/)
- Rust toolchain with `cargo` (needed by `snforge` plugin build)
- A Starknet Sepolia account funded for deployment
- Browser wallet: ArgentX or Braavos

## Contract Commands

From `contracts/`:

```bash
scarb build
scarb test
```

### Sepolia Deploy

Configure your `sncast` account first, then run:

```bash
./scripts/deploy-sepolia.sh
```

If you prefer manual deployment:

```bash
scarb build
sncast declare --contract-name BlindHire
sncast deploy --class-hash <CLASS_HASH> --constructor-calldata
```

## Frontend Setup

From `frontend/`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set environment variables in `.env.local`:

- `NEXT_PUBLIC_BLINDHIRE_CONTRACT_ADDRESS=<deployed_contract_address>`
- `NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia-rpc.publicnode.com` (Blast API deprecated; use PublicNode or Alchemy)

## Demo Workflow (Hackathon Script)

1. Open dApp home (`/`) and connect ArgentX or Braavos.
2. Go to `/create-job` and create a job with future commit/reveal deadlines.
3. Freelancer A and B each go to `/submit-bid`, enter `(job_id, bid_amount, secret)`, and commit.
4. After commit deadline, each freelancer goes to `/reveal-bid` and reveals exact `(bid_amount, secret)`.
5. Go to `/job-result`, load results, and click **Finalize Auction** after reveal deadline.
6. Winner and winning amount should show the lowest valid revealed bid.

## Notes

- Contract compiles with `scarb build`.
- `scarb test` requires `cargo`. If missing, install Rust with [rustup](https://rustup.rs/) and rerun.
