import { Abi } from "starknet";

export const blindHireAbi: Abi = [
  {
    type: "impl",
    name: "BlindHireImpl",
    interface_name: "blindhire::blindhire::IBlindHire",
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>",
      },
      {
        name: "pending_word",
        type: "core::felt252",
      },
      {
        name: "pending_word_len",
        type: "core::internal::bounded_int::BoundedInt::<0, 30>",
      },
    ],
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      { name: "False", type: "()" },
      { name: "True", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "blindhire::blindhire::Job",
    members: [
      {
        name: "client_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "job_description",
        type: "core::byte_array::ByteArray",
      },
      {
        name: "commit_deadline",
        type: "core::integer::u64",
      },
      {
        name: "reveal_deadline",
        type: "core::integer::u64",
      },
      {
        name: "finalized",
        type: "core::bool",
      },
    ],
  },
  {
    type: "struct",
    name: "blindhire::blindhire::Bid",
    members: [
      {
        name: "freelancer_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "commit_hash",
        type: "core::felt252",
      },
      {
        name: "revealed",
        type: "core::bool",
      },
      {
        name: "amount",
        type: "core::integer::u128",
      },
      {
        name: "exists",
        type: "core::bool",
      },
    ],
  },
  {
    type: "interface",
    name: "blindhire::blindhire::IBlindHire",
    items: [
      {
        type: "function",
        name: "create_job",
        inputs: [
          {
            name: "description",
            type: "core::byte_array::ByteArray",
          },
          {
            name: "commit_deadline",
            type: "core::integer::u64",
          },
          {
            name: "reveal_deadline",
            type: "core::integer::u64",
          },
        ],
        outputs: [{ type: "core::integer::u64" }],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "commit_bid",
        inputs: [
          { name: "job_id", type: "core::integer::u64" },
          { name: "commit_hash", type: "core::felt252" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "reveal_bid",
        inputs: [
          { name: "job_id", type: "core::integer::u64" },
          { name: "bid_amount", type: "core::integer::u128" },
          { name: "secret", type: "core::felt252" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "finalize_auction",
        inputs: [{ name: "job_id", type: "core::integer::u64" }],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_job",
        inputs: [{ name: "job_id", type: "core::integer::u64" }],
        outputs: [{ type: "blindhire::blindhire::Job" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_job_count",
        inputs: [],
        outputs: [{ type: "core::integer::u64" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_bid",
        inputs: [
          { name: "job_id", type: "core::integer::u64" },
          {
            name: "freelancer",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "blindhire::blindhire::Bid" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_revealed_bid_count",
        inputs: [{ name: "job_id", type: "core::integer::u64" }],
        outputs: [{ type: "core::integer::u32" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_revealed_bid_at",
        inputs: [
          { name: "job_id", type: "core::integer::u64" },
          { name: "index", type: "core::integer::u32" },
        ],
        outputs: [
          {
            type: "(core::starknet::contract_address::ContractAddress, core::integer::u128)",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_winner",
        inputs: [{ name: "job_id", type: "core::integer::u64" }],
        outputs: [
          {
            type: "(core::bool, core::starknet::contract_address::ContractAddress, core::integer::u128)",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "event",
    name: "blindhire::blindhire::BlindHire::JobCreated",
    kind: "struct",
    members: [
      { name: "job_id", type: "core::integer::u64", kind: "data" },
      {
        name: "client_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      { name: "commit_deadline", type: "core::integer::u64", kind: "data" },
      { name: "reveal_deadline", type: "core::integer::u64", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "blindhire::blindhire::BlindHire::BidCommitted",
    kind: "struct",
    members: [
      { name: "job_id", type: "core::integer::u64", kind: "data" },
      {
        name: "freelancer_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "blindhire::blindhire::BlindHire::BidRevealed",
    kind: "struct",
    members: [
      { name: "job_id", type: "core::integer::u64", kind: "data" },
      {
        name: "freelancer_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      { name: "amount", type: "core::integer::u128", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "blindhire::blindhire::BlindHire::AuctionFinalized",
    kind: "struct",
    members: [
      { name: "job_id", type: "core::integer::u64", kind: "data" },
      {
        name: "winner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      { name: "winning_amount", type: "core::integer::u128", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "blindhire::blindhire::BlindHire::Event",
    kind: "enum",
    variants: [
      {
        name: "JobCreated",
        type: "blindhire::blindhire::BlindHire::JobCreated",
        kind: "nested",
      },
      {
        name: "BidCommitted",
        type: "blindhire::blindhire::BlindHire::BidCommitted",
        kind: "nested",
      },
      {
        name: "BidRevealed",
        type: "blindhire::blindhire::BlindHire::BidRevealed",
        kind: "nested",
      },
      {
        name: "AuctionFinalized",
        type: "blindhire::blindhire::BlindHire::AuctionFinalized",
        kind: "nested",
      },
    ],
  },
] as Abi;
