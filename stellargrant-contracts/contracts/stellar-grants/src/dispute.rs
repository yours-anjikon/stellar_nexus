use soroban_sdk::{token, Address, Env, String, Vec};

use crate::events::Events;
use crate::storage::Storage;
use crate::types::{ContractError, Dispute, DisputeStatus, Grant};

pub fn raise_dispute(
    env: &Env,
    grant: &Grant,
    milestone_idx: u32,
    caller: &Address,
    reason: String,
) -> Result<Dispute, ContractError> {
    let is_owner = grant.owner == *caller;
    let is_reviewer = grant.reviewers.contains(caller.clone());
    if !(is_owner || is_reviewer) {
        return Err(ContractError::Unauthorized);
    }

    if Storage::get_dispute(env, grant.id, milestone_idx).is_some() {
        return Err(ContractError::InvalidState);
    }

    let dispute = Dispute {
        grant_id: grant.id,
        milestone_idx,
        raised_by: caller.clone(),
        reason,
        status: DisputeStatus::Open,
        arbiters: Vec::new(env),
        votes_contributor: 0,
        votes_funder: 0,
        raised_at: env.ledger().timestamp(),
        resolved_at: None,
    };

    Storage::set_dispute(env, grant.id, milestone_idx, &dispute);
    Events::emit_dispute_raised(env, grant.id, milestone_idx, caller.clone());
    Ok(dispute)
}

pub fn assign_arbiter(
    env: &Env,
    dispute: &mut Dispute,
    admin: &Address,
    arbiter: &Address,
) -> Result<(), ContractError> {
    if dispute.status != DisputeStatus::Open {
        return Err(ContractError::InvalidState);
    }
    if !crate::access::has_role(env, admin, crate::types::Role::Admin)
        && Storage::get_global_admin(env) != Some(admin.clone())
    {
        return Err(ContractError::NotContractAdmin);
    }
    if dispute.arbiters.contains(arbiter.clone()) {
        return Err(ContractError::AlreadyVoted);
    }
    dispute.arbiters.push_back(arbiter.clone());
    dispute.status = DisputeStatus::UnderReview;
    Storage::set_dispute(env, dispute.grant_id, dispute.milestone_idx, dispute);
    Events::emit_arbiter_assigned(
        env,
        dispute.grant_id,
        dispute.milestone_idx,
        arbiter.clone(),
    );
    Ok(())
}

pub fn arbiter_vote(
    env: &Env,
    dispute: &mut Dispute,
    arbiter: &Address,
    favor_contributor: bool,
) -> Result<(), ContractError> {
    if dispute.status != DisputeStatus::UnderReview {
        return Err(ContractError::InvalidState);
    }
    if !dispute.arbiters.contains(arbiter.clone()) {
        return Err(ContractError::Unauthorized);
    }
    if favor_contributor {
        dispute.votes_contributor = dispute.votes_contributor.saturating_add(1);
    } else {
        dispute.votes_funder = dispute.votes_funder.saturating_add(1);
    }
    Storage::set_dispute(env, dispute.grant_id, dispute.milestone_idx, dispute);
    Events::emit_arbiter_voted(
        env,
        dispute.grant_id,
        dispute.milestone_idx,
        arbiter.clone(),
        favor_contributor,
    );
    Ok(())
}

pub fn resolve_dispute(
    env: &Env,
    grant: &mut Grant,
    dispute: &mut Dispute,
) -> Result<DisputeStatus, ContractError> {
    if dispute.status != DisputeStatus::UnderReview {
        return Err(ContractError::InvalidState);
    }

    let total_votes = dispute
        .votes_contributor
        .saturating_add(dispute.votes_funder);
    if total_votes == 0 {
        return Err(ContractError::InvalidState);
    }

    let majority = total_votes / 2 + 1;
    let outcome = if dispute.votes_contributor >= majority {
        DisputeStatus::ResolvedForContributor
    } else if dispute.votes_funder >= majority {
        DisputeStatus::ResolvedForFunder
    } else {
        return Err(ContractError::QuorumNotReached);
    };

    let grant_id = dispute.grant_id;
    let milestone_idx = dispute.milestone_idx;

    if outcome == DisputeStatus::ResolvedForContributor {
        if let Some(milestone) = Storage::get_milestone(env, grant_id, milestone_idx) {
            let payout_token = milestone.payout_token.clone();
            let balance = grant.escrow_balances.get(payout_token.clone()).unwrap_or(0);
            if balance >= milestone.amount {
                token::Client::new(env, &payout_token).transfer(
                    &env.current_contract_address(),
                    &grant.owner,
                    &milestone.amount,
                );
                grant.escrow_balances.set(
                    payout_token,
                    balance
                        .checked_sub(milestone.amount)
                        .ok_or(ContractError::InsufficientBalance)?,
                );
            }
        }
    } else {
        if let Some(milestone) = Storage::get_milestone(env, grant_id, milestone_idx) {
            let payout_token = milestone.payout_token.clone();
            let balance = grant.escrow_balances.get(payout_token.clone()).unwrap_or(0);
            if balance >= milestone.amount && !grant.funders.is_empty() {
                let mut total_contributed: i128 = 0;
                for fund in grant.funders.iter() {
                    if fund.token == payout_token {
                        total_contributed = total_contributed.saturating_add(fund.amount);
                    }
                }
                if total_contributed > 0 {
                    let tok_client = token::Client::new(env, &payout_token);
                    let mut distributed: i128 = 0;
                    let funders_len = grant.funders.len();
                    for i in 0..funders_len {
                        let fund = grant.funders.get(i).ok_or(ContractError::InvalidInput)?;
                        if fund.token != payout_token {
                            continue;
                        }
                        let is_last = i + 1 == funders_len;
                        let share = if is_last {
                            milestone.amount - distributed
                        } else {
                            fund.amount
                                .checked_mul(milestone.amount)
                                .ok_or(ContractError::InvalidInput)?
                                .checked_div(total_contributed)
                                .ok_or(ContractError::InvalidInput)?
                        };
                        if share > 0 {
                            tok_client.transfer(
                                &env.current_contract_address(),
                                &fund.funder,
                                &share,
                            );
                            distributed = distributed.saturating_add(share);
                        }
                    }
                    grant.escrow_balances.set(
                        payout_token,
                        balance
                            .checked_sub(distributed)
                            .ok_or(ContractError::InsufficientBalance)?,
                    );
                }
            }
        }
    }

    dispute.status = outcome.clone();
    dispute.resolved_at = Some(env.ledger().timestamp());
    Storage::set_dispute(env, grant_id, milestone_idx, dispute);

    let for_contributor = outcome == DisputeStatus::ResolvedForContributor;
    Events::emit_dispute_resolved(env, grant_id, milestone_idx, for_contributor);
    Ok(outcome)
}

pub fn cancel_dispute(
    env: &Env,
    dispute: &mut Dispute,
    caller: &Address,
) -> Result<(), ContractError> {
    if dispute.status != DisputeStatus::Open && dispute.status != DisputeStatus::UnderReview {
        return Err(ContractError::InvalidState);
    }
    if dispute.raised_by != *caller
        && !crate::access::has_role(env, caller, crate::types::Role::Admin)
        && Storage::get_global_admin(env) != Some(caller.clone())
    {
        return Err(ContractError::Unauthorized);
    }
    dispute.status = DisputeStatus::Cancelled;
    dispute.resolved_at = Some(env.ledger().timestamp());
    Storage::set_dispute(env, dispute.grant_id, dispute.milestone_idx, dispute);
    Events::emit_dispute_cancelled(env, dispute.grant_id, dispute.milestone_idx, caller.clone());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{Grant, GrantStatus};
    use soroban_sdk::{testutils::Address as _, Env, String, Vec};

    fn make_grant(env: &Env, owner: Address) -> Grant {
        let token = Address::generate(env);
        Grant::new(
            1,
            owner.clone(),
            String::from_str(env, "T"),
            String::from_str(env, "D"),
            token,
            1000,
            500,
            Vec::new(env),
            GrantStatus::Active,
            1,
            2,
            env.ledger().timestamp(),
            0,
            0,
            Vec::new(env),
            false,
            env,
        )
    }

    #[test]
    fn test_raise_dispute_unauthorized() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let stranger = Address::generate(&env);
        let grant = make_grant(&env, owner);
        let reason = String::from_str(&env, "Proof is invalid");
        let result = raise_dispute(&env, &grant, 0, &stranger, reason);
        assert_eq!(result, Err(ContractError::Unauthorized));
    }

    #[test]
    fn test_arbiter_quorum_not_reached_returns_error() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let grant = make_grant(&env, owner.clone());

        // 1 vote each — neither side has majority of 2 needed
        let mut dispute = Dispute {
            grant_id: 1,
            milestone_idx: 0,
            raised_by: owner.clone(),
            reason: String::from_str(&env, "reason"),
            status: DisputeStatus::UnderReview,
            arbiters: Vec::new(&env),
            votes_contributor: 1,
            votes_funder: 1,
            raised_at: 0,
            resolved_at: None,
        };

        let mut grant_mut = grant.clone();
        let result = resolve_dispute(&env, &mut grant_mut, &mut dispute);
        assert_eq!(result, Err(ContractError::QuorumNotReached));
    }

    #[test]
    fn test_resolve_dispute_wrong_status_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let grant = make_grant(&env, owner.clone());

        // Status is Open, not UnderReview
        let mut dispute = Dispute {
            grant_id: 1,
            milestone_idx: 0,
            raised_by: owner.clone(),
            reason: String::from_str(&env, "reason"),
            status: DisputeStatus::Open,
            arbiters: Vec::new(&env),
            votes_contributor: 3,
            votes_funder: 0,
            raised_at: 0,
            resolved_at: None,
        };

        let mut grant_mut = grant.clone();
        let result = resolve_dispute(&env, &mut grant_mut, &mut dispute);
        assert_eq!(result, Err(ContractError::InvalidState));
    }

    #[test]
    fn test_arbiter_vote_on_wrong_status_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let arbiter = Address::generate(&env);
        let mut dispute = Dispute {
            grant_id: 1,
            milestone_idx: 0,
            raised_by: owner.clone(),
            reason: String::from_str(&env, "reason"),
            status: DisputeStatus::Open,
            arbiters: {
                let mut v = Vec::new(&env);
                v.push_back(arbiter.clone());
                v
            },
            votes_contributor: 0,
            votes_funder: 0,
            raised_at: 0,
            resolved_at: None,
        };
        let result = arbiter_vote(&env, &mut dispute, &arbiter, true);
        assert_eq!(result, Err(ContractError::InvalidState));
    }

    #[test]
    fn test_arbiter_vote_by_non_arbiter_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let stranger = Address::generate(&env);
        let mut dispute = Dispute {
            grant_id: 1,
            milestone_idx: 0,
            raised_by: owner.clone(),
            reason: String::from_str(&env, "reason"),
            status: DisputeStatus::UnderReview,
            arbiters: Vec::new(&env),
            votes_contributor: 0,
            votes_funder: 0,
            raised_at: 0,
            resolved_at: None,
        };
        let result = arbiter_vote(&env, &mut dispute, &stranger, true);
        assert_eq!(result, Err(ContractError::Unauthorized));
    }
}
