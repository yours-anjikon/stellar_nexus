# Gas Reduction — Planned Contract Upgrade

**Status:** Design / not yet implemented
**Type:** In-place `upgrade()` of existing mainnet contracts (no redeploy, no new addresses)
**Goal:** Lower the *first-time* fees users pay (first bet on a market ≈ 0.3 XLM,
username registration ≈ 0.31 XLM) **without** reducing storage TTL — because some
markets run **12+ months** before users can claim, and an expired entry would
force a costly restore right when a winner tries to collect.

---

## 1. Why the first-time fee is high (root cause)

Soroban charges a **resource fee** per transaction that is dominated by two things:

1. **New persistent storage entries** — each *new* ledger entry created is charged
   create + rent for its full TTL window upfront.
2. **Cross-contract calls** (`invoke_contract`) — each call into another contract
   (token mint, leaderboard add_pts, referral credit) adds CPU + a footprint
   entry, both metered.

A user's **first** bet or registration is expensive because it *creates several
new entries at once* and *makes several cross-contract calls*. Every later action
on the same key is cheap (it's an in-place update, no new entry).

### Measured cost concentration

**`place_bet` (first bet on a market) creates these NEW persistent entries:**

| Entry | Purpose | Removable? |
|-------|---------|------------|
| `Bet(market_id, user)` | the user's actual bet (net/gross/count) | ❌ load-bearing |
| `HasReferrer(user)` | cache so later bets skip the referral cross-call | ⚠️ optimization, costs a write |
| `BettorAt(market_id, n)` | bettor-index slot (enumeration) | ❌ used by leaderboard + referral discovery |
| `BettorCount(market_id)` | bettor-index length | ❌ used by leaderboard |

…plus a cross-contract `credit` call into the referral registry (which itself may
mint tokens + add points).

**`register_referral` creates FOUR new persistent entries in one call:**
`Registered(user)`, `DisplayName(user)`, `Referrer(user)`, `ReferralCount(referrer)`
— **plus two cross-contract calls** (`add_bonus_pts` to leaderboard, `mint` to token).
Four new entries + two cross-calls in a single tx is why first-time registration
is ~0.31 XLM.

---

## 2. What we will NOT do (and why)

❌ **Do NOT lower `TTL_HIGH` / `TTL_BUMP`.**
Current: `TTL_HIGH = 6,307,200` ledgers ≈ **1 year**.
Some markets are designed to run **12+ months** before resolution/claim. If a
bet entry's TTL expired before the user claimed, the entry would be archived and
the user (or we) would have to **pay to restore it** before claiming — the single
worst possible "scared by fees" moment. The TTL must always exceed
`market_duration + claim_window`. Shortening it to save rent is a false economy
here. **Keep TTL at ≥ 1 year; if anything, make it derive from market duration
so long markets get a longer TTL, not a shorter one.**

---

## 3. What we WILL do — reduce entry count & cross-calls

The safe levers are **fewer new entries** and **fewer cross-contract calls**,
which cut resource fees without any storage-lifetime risk.

### Lever A — Pack `register_referral` storage into one entry (biggest single win)

Today registration writes 4 separate persistent keys. Pack them into **one
struct** under a single key:

```rust
#[contracttype]
pub struct UserProfile {
    pub registered:   bool,
    pub display_name: String,
    pub referrer:     Option<Address>,
}
```

- Writes **1 new entry** instead of 3 (the user's own profile). `ReferralCount`
  for the *referrer* is a separate user's entry and stays separate, but it's an
  **update** of an existing entry in the common case, not a new create.
- Read paths (`get_referrer`, `get_display_name`, `is_registered`) read one entry
  instead of three — also cheaper for the app.
- **Est. saving on first registration: ~40–50%** (≈0.31 → ~0.16–0.18 XLM).

### Lever B — Defer / batch the cross-contract reward calls

Both `register_referral` and `place_bet`→`credit` make **two cross-contract calls**
(`mint` token + `add_*_pts` leaderboard) inline. Each call is metered CPU + an
extra footprint entry.

Options (in order of preference):

1. **Combine the two reward calls behind ONE call.** Add a single
   `reward(user, points, tokens, is_win)` entry point on a rewards facade (or on
   the leaderboard) that internally credits points and mints tokens, so the market
   makes **1** cross-call instead of 2. Halves the cross-call overhead on the hot
   path.
2. **Make reward minting claim-style / lazy.** Instead of minting IPRED tokens at
   bet/claim time (a cross-call every time), accrue an off-chain or on-chain
   "claimable rewards" counter and let the user mint in one batch later. Removes
   the `mint` cross-call from the hot path entirely. (Bigger change — schedule
   separately.)

### Lever C — Make `HasReferrer` cache opt-in, not eager

The `HasReferrer(user)` entry is written on the first bet purely to *save a
cross-call on later bets*. For a user who only ever bets once, it's pure cost.
Consider writing it **only after the user's second bet** (i.e. when the
optimization actually pays off), or folding the flag into the `Bet`/`UserProfile`
struct so it costs no separate entry.

### Lever D — Confirm the bettor index is still required

`BettorAt` / `BettorCount` are currently used by the leaderboard ("most active")
and referral discovery (`getMarketBettors` fan-out in the frontend). **Do not
remove them** unless those features are first migrated to an event-based indexer.
If we later move leaderboard/referral discovery to reading **contract events**
(emitted on bet, indexed off-chain), we could drop both index entries and cut
another new-entry write from every first bet — but that's a frontend + indexer
change to land first.

---

## 4. Expected outcome

| Action | Now | After A+B+C |
|--------|-----|-------------|
| First bet on a market | ~0.30 XLM | ~0.15–0.20 XLM |
| Username registration | ~0.31 XLM | ~0.14–0.18 XLM |
| Subsequent bets (increase) | ~0.0003 XLM | ~0.0003 XLM (unchanged) |

All while **keeping TTL ≥ 1 year** so no entry ever expires before a 12-month
market can be claimed.

---

## 5. Rollout (safe, in-place)

1. Implement levers A–C behind the existing `upgrade()` entry point. Storage is
   preserved across `upgrade()`.
2. **Migration note for Lever A:** packing 3 keys into 1 struct changes the
   storage layout. Either (a) keep reading the old keys as a fallback for already-
   registered users and write the new struct on next interaction (lazy migration),
   or (b) ship a one-time admin `migrate_profiles()` that folds existing users.
   Lazy migration is preferred — zero admin cost, no big batch tx.
3. Verify on testnet first (full place_bet → claim → register cycle), confirm the
   resource fee drop in the simulation, then `upgrade()` mainnet (sub-1-XLM).
4. Update the frontend's first-bet fee note copy with the new lower number.

---

## 6. UX backstop (ship regardless)

Independent of the contract work, add a one-line note in the betting / register
panels: *"Your first action on iPredict includes a small one-time on-chain
storage fee. Everything after that is nearly free."* Users abandon over
**surprise** fees, not understood ones. This requires no contract change and
should ship first.
