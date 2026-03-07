use blindhire::blindhire::{IBlindHireDispatcher, IBlindHireDispatcherTrait};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, start_cheat_block_timestamp,
    stop_cheat_block_timestamp, start_cheat_caller_address, stop_cheat_caller_address,
};
use core::traits::TryInto;
use starknet::ContractAddress;

fn client_address() -> ContractAddress {
    111.try_into().unwrap()
}
fn freelancer_a_address() -> ContractAddress {
    222.try_into().unwrap()
}
fn freelancer_b_address() -> ContractAddress {
    333.try_into().unwrap()
}

fn deploy_contract() -> IBlindHireDispatcher {
    let contract = declare("BlindHire").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@array![]).unwrap();
    IBlindHireDispatcher { contract_address }
}


#[test]
fn test_happy_path_lowest_revealed_bid_wins() {
    let dispatcher: IBlindHireDispatcher = deploy_contract();

    start_cheat_block_timestamp(dispatcher.contract_address, 100);
    start_cheat_caller_address(dispatcher.contract_address, client_address());
    let job_id = dispatcher.create_job("Build a landing page", 200, 300);
    stop_cheat_caller_address(dispatcher.contract_address);

    let secret_a: felt252 = 777;
    let secret_b: felt252 = 888;
    let bid_a: u128 = 1200;
    let bid_b: u128 = 1100;

    let commit_hash_a = core::pedersen::pedersen(bid_a.into(), secret_a);
    let commit_hash_b = core::pedersen::pedersen(bid_b.into(), secret_b);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.commit_bid(job_id, commit_hash_a);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_b_address());
    dispatcher.commit_bid(job_id, commit_hash_b);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_block_timestamp(dispatcher.contract_address, 250);
    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.reveal_bid(job_id, bid_a, secret_a);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_b_address());
    dispatcher.reveal_bid(job_id, bid_b, secret_b);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_block_timestamp(dispatcher.contract_address, 301);
    dispatcher.finalize_auction(job_id);

    let (has_winner, winner, amount) = dispatcher.get_winner(job_id);
    assert(has_winner, 'winner should exist');
    assert(winner == freelancer_b_address(), 'lowest bidder should win');
    assert(amount == bid_b, 'winning amount mismatch');

    stop_cheat_block_timestamp(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: ('COMMIT_PHASE_ENDED',))]
fn test_reject_commit_after_deadline() {
    let dispatcher: IBlindHireDispatcher = deploy_contract();

    start_cheat_block_timestamp(dispatcher.contract_address, 100);
    start_cheat_caller_address(dispatcher.contract_address, client_address());
    let job_id = dispatcher.create_job("Simple logo task", 200, 300);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_block_timestamp(dispatcher.contract_address, 201);
    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.commit_bid(job_id, 123);
}

#[test]
#[should_panic(expected: ('REVEAL_NOT_STARTED',))]
fn test_reject_reveal_before_reveal_phase() {
    let dispatcher: IBlindHireDispatcher = deploy_contract();

    start_cheat_block_timestamp(dispatcher.contract_address, 100);
    start_cheat_caller_address(dispatcher.contract_address, client_address());
    let job_id = dispatcher.create_job("Design dashboard", 200, 300);
    stop_cheat_caller_address(dispatcher.contract_address);

    let bid: u128 = 2000;
    let secret: felt252 = 444;
    let commit_hash = core::pedersen::pedersen(bid.into(), secret);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.commit_bid(job_id, commit_hash);
    dispatcher.reveal_bid(job_id, bid, secret);
}

#[test]
#[should_panic(expected: ('INVALID_REVEAL',))]
fn test_reject_invalid_reveal_hash() {
    let dispatcher: IBlindHireDispatcher = deploy_contract();

    start_cheat_block_timestamp(dispatcher.contract_address, 100);
    start_cheat_caller_address(dispatcher.contract_address, client_address());
    let job_id = dispatcher.create_job("Build docs portal", 200, 300);
    stop_cheat_caller_address(dispatcher.contract_address);

    let bid: u128 = 900;
    let commit_secret: felt252 = 111;
    let reveal_secret: felt252 = 222;
    let commit_hash = core::pedersen::pedersen(bid.into(), commit_secret);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.commit_bid(job_id, commit_hash);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_block_timestamp(dispatcher.contract_address, 250);
    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.reveal_bid(job_id, bid, reveal_secret);
}

#[test]
#[should_panic(expected: ('BID_ALREADY_EXISTS',))]
fn test_reject_duplicate_bid_from_same_freelancer() {
    let dispatcher: IBlindHireDispatcher = deploy_contract();

    start_cheat_block_timestamp(dispatcher.contract_address, 100);
    start_cheat_caller_address(dispatcher.contract_address, client_address());
    let job_id = dispatcher.create_job("API integration task", 200, 300);
    stop_cheat_caller_address(dispatcher.contract_address);

    start_cheat_caller_address(dispatcher.contract_address, freelancer_a_address());
    dispatcher.commit_bid(job_id, 555);
    dispatcher.commit_bid(job_id, 777);
}
