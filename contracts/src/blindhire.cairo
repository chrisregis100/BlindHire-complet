use starknet::ContractAddress;

#[starknet::interface]
pub trait IBlindHire<TContractState> {
    fn create_job(
        ref self: TContractState, description: ByteArray, commit_deadline: u64, reveal_deadline: u64,
    ) -> u64;
    fn commit_bid(ref self: TContractState, job_id: u64, commit_hash: felt252);
    fn reveal_bid(ref self: TContractState, job_id: u64, bid_amount: u128, secret: felt252);
    fn finalize_auction(ref self: TContractState, job_id: u64);

    fn get_job(self: @TContractState, job_id: u64) -> Job;
    fn get_job_count(self: @TContractState) -> u64;
    fn get_bid(self: @TContractState, job_id: u64, freelancer: ContractAddress) -> Bid;
    fn get_revealed_bid_count(self: @TContractState, job_id: u64) -> u32;
    fn get_revealed_bid_at(self: @TContractState, job_id: u64, index: u32) -> (ContractAddress, u128);
    fn get_winner(self: @TContractState, job_id: u64) -> (bool, ContractAddress, u128);
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Job {
    pub client_address: ContractAddress,
    pub job_description: ByteArray,
    pub commit_deadline: u64,
    pub reveal_deadline: u64,
    pub finalized: bool,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Bid {
    pub freelancer_address: ContractAddress,
    pub commit_hash: felt252,
    pub revealed: bool,
    pub amount: u128,
    pub exists: bool,
}

#[starknet::contract]
mod BlindHire {
    use super::{Bid, IBlindHire, Job};
    use core::pedersen::pedersen;
    use starknet::storage::{Map, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    #[storage]
    struct Storage {
        pub job_count: u64,
        pub jobs: Map<u64, Job>,
        pub bids: Map<(u64, ContractAddress), Bid>,
        pub revealed_bid_count: Map<u64, u32>,
        pub revealed_bidder_by_index: Map<(u64, u32), ContractAddress>,
        pub winner_by_job: Map<u64, ContractAddress>,
        pub winning_amount_by_job: Map<u64, u128>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        JobCreated: JobCreated,
        BidCommitted: BidCommitted,
        BidRevealed: BidRevealed,
        AuctionFinalized: AuctionFinalized,
    }

    #[derive(Drop, starknet::Event)]
    pub struct JobCreated {
        pub job_id: u64,
        pub client_address: ContractAddress,
        pub commit_deadline: u64,
        pub reveal_deadline: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BidCommitted {
        pub job_id: u64,
        pub freelancer_address: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BidRevealed {
        pub job_id: u64,
        pub freelancer_address: ContractAddress,
        pub amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    pub struct AuctionFinalized {
        pub job_id: u64,
        pub winner: ContractAddress,
        pub winning_amount: u128,
    }

    #[abi(embed_v0)]
    impl BlindHireImpl of IBlindHire<ContractState> {
        fn create_job(
            ref self: ContractState, description: ByteArray, commit_deadline: u64, reveal_deadline: u64,
        ) -> u64 {
            let now = get_block_timestamp();
            assert(commit_deadline > now, 'COMMIT_IN_PAST');
            assert(reveal_deadline > commit_deadline, 'BAD_REVEAL_DEADLINE');

            let job_id = self.job_count.read();
            let caller = get_caller_address();

            self.jobs.entry(job_id).write(
                Job {
                    client_address: caller,
                    job_description: description,
                    commit_deadline,
                    reveal_deadline,
                    finalized: false,
                },
            );
            self.job_count.write(job_id + 1);
            self.revealed_bid_count.entry(job_id).write(0);

            self.emit(
                Event::JobCreated(
                    JobCreated {
                        job_id, client_address: caller, commit_deadline, reveal_deadline,
                    },
                ),
            );

            job_id
        }

        fn commit_bid(ref self: ContractState, job_id: u64, commit_hash: felt252) {
            assert_valid_job(ref self, job_id);

            let job = self.jobs.entry(job_id).read();
            let now = get_block_timestamp();
            assert(now < job.commit_deadline, 'COMMIT_PHASE_ENDED');

            let freelancer = get_caller_address();
            let existing_bid = self.bids.entry((job_id, freelancer)).read();
            assert(!existing_bid.exists, 'BID_ALREADY_EXISTS');

            self.bids.entry((job_id, freelancer)).write(
                Bid {
                    freelancer_address: freelancer,
                    commit_hash,
                    revealed: false,
                    amount: 0,
                    exists: true,
                },
            );

            self.emit(Event::BidCommitted(BidCommitted { job_id, freelancer_address: freelancer }));
        }

        fn reveal_bid(ref self: ContractState, job_id: u64, bid_amount: u128, secret: felt252) {
            assert_valid_job(ref self, job_id);

            let job = self.jobs.entry(job_id).read();
            let now = get_block_timestamp();
            assert(now >= job.commit_deadline, 'REVEAL_NOT_STARTED');
            assert(now < job.reveal_deadline, 'REVEAL_PHASE_ENDED');

            let freelancer = get_caller_address();
            let current_bid = self.bids.entry((job_id, freelancer)).read();
            assert(current_bid.exists, 'BID_NOT_FOUND');
            assert(!current_bid.revealed, 'BID_ALREADY_REVEALED');

            // Commit-reveal verification:
            // bidder proves knowledge of (amount, secret) that produced commit_hash.
            let expected_hash = pedersen(bid_amount.into(), secret);
            assert(expected_hash == current_bid.commit_hash, 'INVALID_REVEAL');

            let updated_bid = Bid { revealed: true, amount: bid_amount, ..current_bid };
            self.bids.entry((job_id, freelancer)).write(updated_bid);

            let revealed_index = self.revealed_bid_count.entry(job_id).read();
            self.revealed_bidder_by_index.entry((job_id, revealed_index)).write(freelancer);
            self.revealed_bid_count.entry(job_id).write(revealed_index + 1);

            self.emit(
                Event::BidRevealed(
                    BidRevealed { job_id, freelancer_address: freelancer, amount: bid_amount },
                ),
            );
        }

        fn finalize_auction(ref self: ContractState, job_id: u64) {
            assert_valid_job(ref self, job_id);

            let now = get_block_timestamp();
            let current_job = self.jobs.entry(job_id).read();
            assert(now >= current_job.reveal_deadline, 'REVEAL_STILL_OPEN');
            assert(!current_job.finalized, 'ALREADY_FINALIZED');

            let revealed_count = self.revealed_bid_count.entry(job_id).read();
            let mut current_index: u32 = 0;
            let mut has_winner = false;
            let mut winner_address: ContractAddress = 0.try_into().unwrap();
            let mut lowest_bid: u128 = 0;

            loop {
                if current_index >= revealed_count {
                    break;
                }

                let bidder = self.revealed_bidder_by_index.entry((job_id, current_index)).read();
                let bidder_bid = self.bids.entry((job_id, bidder)).read();

                if bidder_bid.revealed {
                    if !has_winner {
                        has_winner = true;
                        winner_address = bidder;
                        lowest_bid = bidder_bid.amount;
                    } else {
                        if bidder_bid.amount < lowest_bid {
                            winner_address = bidder;
                            lowest_bid = bidder_bid.amount;
                        }
                    }
                }

                current_index += 1;
            };

            assert(has_winner, 'NO_REVEALED_BIDS');

            let finalized_job = Job { finalized: true, ..current_job };
            self.jobs.entry(job_id).write(finalized_job);
            self.winner_by_job.entry(job_id).write(winner_address);
            self.winning_amount_by_job.entry(job_id).write(lowest_bid);

            self.emit(
                Event::AuctionFinalized(
                    AuctionFinalized { job_id, winner: winner_address, winning_amount: lowest_bid },
                ),
            );
        }

        fn get_job(self: @ContractState, job_id: u64) -> Job {
            assert_valid_job_view(self, job_id);
            self.jobs.entry(job_id).read()
        }

        fn get_job_count(self: @ContractState) -> u64 {
            self.job_count.read()
        }

        fn get_bid(self: @ContractState, job_id: u64, freelancer: ContractAddress) -> Bid {
            assert_valid_job_view(self, job_id);
            self.bids.entry((job_id, freelancer)).read()
        }

        fn get_revealed_bid_count(self: @ContractState, job_id: u64) -> u32 {
            assert_valid_job_view(self, job_id);
            self.revealed_bid_count.entry(job_id).read()
        }

        fn get_revealed_bid_at(
            self: @ContractState, job_id: u64, index: u32,
        ) -> (ContractAddress, u128) {
            assert_valid_job_view(self, job_id);

            let count = self.revealed_bid_count.entry(job_id).read();
            assert(index < count, 'INDEX_OUT_OF_RANGE');

            let bidder = self.revealed_bidder_by_index.entry((job_id, index)).read();
            let bid = self.bids.entry((job_id, bidder)).read();
            (bidder, bid.amount)
        }

        fn get_winner(self: @ContractState, job_id: u64) -> (bool, ContractAddress, u128) {
            assert_valid_job_view(self, job_id);

            let job = self.jobs.entry(job_id).read();
            if !job.finalized {
                let empty_address: ContractAddress = 0.try_into().unwrap();
                return (false, empty_address, 0);
            }

            (
                true, self.winner_by_job.entry(job_id).read(), self.winning_amount_by_job.entry(job_id).read(),
            )
        }
    }

    fn assert_valid_job(ref self: ContractState, job_id: u64) {
        let total_jobs = self.job_count.read();
        assert(job_id < total_jobs, 'INVALID_JOB');
    }

    fn assert_valid_job_view(self: @ContractState, job_id: u64) {
        let total_jobs = self.job_count.read();
        assert(job_id < total_jobs, 'INVALID_JOB');
    }
}
