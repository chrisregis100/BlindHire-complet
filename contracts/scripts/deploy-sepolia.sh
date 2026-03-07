#!/usr/bin/env bash
set -euo pipefail

# BlindHire Starknet Sepolia deployment helper.
# Prerequisites:
# 1) sncast configured with account + RPC (`sncast account add`, `sncast --url ...`)
# 2) Contract compiled (`scarb build`)

if ! command -v sncast >/dev/null 2>&1; then
  echo "sncast is required but not installed."
  exit 1
fi

echo "Building contract..."
scarb build

echo "Declaring BlindHire contract..."
DECLARE_OUTPUT=$(sncast declare --contract-name BlindHire)
echo "$DECLARE_OUTPUT"

CLASS_HASH=$(echo "$DECLARE_OUTPUT" | awk '/class_hash/ { print $2 }')
if [ -z "${CLASS_HASH:-}" ]; then
  echo "Failed to parse class hash from sncast output."
  exit 1
fi

echo "Deploying BlindHire contract..."
DEPLOY_OUTPUT=$(sncast deploy --class-hash "$CLASS_HASH" --constructor-calldata)
echo "$DEPLOY_OUTPUT"

CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | awk '/contract_address/ { print $2 }')
if [ -n "${CONTRACT_ADDRESS:-}" ]; then
  echo "BlindHire deployed at: $CONTRACT_ADDRESS"
else
  echo "Deployment completed, but contract address parse failed. Check output above."
fi
