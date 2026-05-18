#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    token::{StellarAssetClient, TokenClient},
    Env, IntoVal,
};

struct Setup<'a> {
    env: Env,
    contract_id: Address,
    client: TariffShieldContractClient<'a>,
    admin: Address,
    surety: Address,
    importer: Address,
    funder: Address,
    token: TokenClient<'a>,
    token_admin: StellarAssetClient<'a>,
    token_addr: Address,
}

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let surety = Address::generate(&env);
    let importer = Address::generate(&env);
    let funder = Address::generate(&env);
    let token_admin_addr = Address::generate(&env);

    let token_sac = env.register_stellar_asset_contract_v2(token_admin_addr.clone());
    let token_addr = token_sac.address();
    let token = TokenClient::new(&env, &token_addr);
    let token_admin = StellarAssetClient::new(&env, &token_addr);

    token_admin.mint(&funder, &1_000_000_0000000);
    token_admin.mint(&importer, &500_000_0000000);

    let contract_id = env.register(TariffShieldContract, ());
    let client = TariffShieldContractClient::new(&env, &contract_id);

    client.initialize(&admin, &surety, &token_addr);

    Setup {
        env,
        contract_id,
        client,
        admin,
        surety,
        importer,
        funder,
        token,
        token_admin,
        token_addr,
    }
}

#[test]
fn initialize_sets_admin_surety_token() {
    let s = setup();
    assert_eq!(s.client.get_admin(), s.admin);
    assert_eq!(s.client.get_surety(), s.surety);
    assert_eq!(s.client.get_token(), s.token_addr);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn cannot_initialize_twice() {
    let s = setup();
    s.client.initialize(&s.admin, &s.surety, &s.token_addr);
}

#[test]
fn register_importer_creates_zero_balance_account() {
    let s = setup();
    s.client.register_importer(&s.importer, &42, &100_000_0000000);
    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.bond_id, 42);
    assert_eq!(acct.collateral_balance, 0);
    assert_eq!(acct.required_collateral, 100_000_0000000);
    assert_eq!(acct.reserve_balance, 0);
    assert_eq!(acct.is_clawbacked, false);
}

#[test]
fn deposit_collateral_transfers_token_and_updates_balance() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &100_000_0000000);

    let funder_before = s.token.balance(&s.funder);
    s.client.deposit_collateral(&s.importer, &s.funder, &50_000_0000000);

    assert_eq!(s.token.balance(&s.funder), funder_before - 50_000_0000000);
    assert_eq!(s.token.balance(&s.contract_id), 50_000_0000000);
    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.collateral_balance, 50_000_0000000);
}

#[test]
fn deposit_reserve_credits_reserve_bucket() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &100_000_0000000);
    s.client.deposit_reserve(&s.importer, &s.funder, &30_000_0000000);
    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.reserve_balance, 30_000_0000000);
    assert_eq!(acct.collateral_balance, 0);
}

#[test]
fn auto_top_up_moves_reserve_to_collateral_up_to_shortfall() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &100_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &60_000_0000000);
    s.client.deposit_reserve(&s.importer, &s.funder, &50_000_0000000);

    let moved = s.client.auto_top_up(&s.importer);
    assert_eq!(moved, 40_000_0000000);

    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.collateral_balance, 100_000_0000000);
    assert_eq!(acct.reserve_balance, 10_000_0000000);
}

#[test]
fn auto_top_up_is_zero_when_collateral_already_meets_required() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &60_000_0000000);
    s.client.deposit_reserve(&s.importer, &s.funder, &10_000_0000000);

    assert_eq!(s.client.auto_top_up(&s.importer), 0);
}

#[test]
fn auto_top_up_uses_partial_reserve_when_reserve_insufficient() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &100_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &20_000_0000000);
    s.client.deposit_reserve(&s.importer, &s.funder, &30_000_0000000);

    let moved = s.client.auto_top_up(&s.importer);
    assert_eq!(moved, 30_000_0000000);

    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.collateral_balance, 50_000_0000000);
    assert_eq!(acct.reserve_balance, 0);
}

#[test]
fn set_required_collateral_updates_target() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &100_000_0000000);
    s.client.set_required_collateral(&s.importer, &175_000_0000000);
    assert_eq!(s.client.get_account(&s.importer).required_collateral, 175_000_0000000);
}

#[test]
fn withdraw_collateral_succeeds_when_collateral_above_required() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &80_000_0000000);

    s.client.withdraw_collateral(&s.importer, &s.importer, &20_000_0000000);

    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.collateral_balance, 60_000_0000000);
    assert_eq!(s.token.balance(&s.importer), 500_000_0000000 + 20_000_0000000);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn withdraw_collateral_fails_when_would_breach_required() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &60_000_0000000);
    s.client.withdraw_collateral(&s.importer, &s.importer, &20_000_0000000);
}

#[test]
fn accrue_yield_increments_yield_accrued() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.accrue_yield(&s.importer, &123_4567);
    s.client.accrue_yield(&s.importer, &500_0000);
    assert_eq!(s.client.get_account(&s.importer).yield_accrued, 623_4567);
}

#[test]
fn clawback_drains_buckets_to_surety_and_freezes_account() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.deposit_collateral(&s.importer, &s.funder, &40_000_0000000);
    s.client.deposit_reserve(&s.importer, &s.funder, &15_000_0000000);

    let surety_before = s.token.balance(&s.surety);
    let taken = s.client.clawback(&s.importer);

    assert_eq!(taken, 55_000_0000000);
    assert_eq!(s.token.balance(&s.surety), surety_before + 55_000_0000000);

    let acct = s.client.get_account(&s.importer);
    assert_eq!(acct.collateral_balance, 0);
    assert_eq!(acct.reserve_balance, 0);
    assert_eq!(acct.is_clawbacked, true);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn deposit_after_clawback_is_rejected() {
    let s = setup();
    s.client.register_importer(&s.importer, &1, &50_000_0000000);
    s.client.clawback(&s.importer);
    s.client.deposit_collateral(&s.importer, &s.funder, &1_0000000);
}
