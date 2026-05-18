# Pitch

> Mid-market US importers lock $500K–$5M in cash collateral with their surety. That cash earns 0% for an average 314 days a year. TariffShield replaces it with yield-bearing USDC in a Soroban escrow contract that auto-tops-up the bond during tariff spikes, with surety-side emergency clawback authority preserved.

---

## The problem

A US importer of consumer electronics — say a 200-person DTC brand doing $40M in COGS from Shenzhen, Vietnam, Bangladesh — needs a **continuous customs bond** to clear shipments through CBP. The bond is the importer's guarantee that they'll pay duties + taxes + fees + any AD/CVD penalties. CBP sizes the bond at roughly **10% of expected annual duty obligation**. The importer's surety (Roanoke Insurance Group, Avalon Risk Management, GreatAmerican Surety, Liberty Mutual) then requires **50–100% cash collateral** against the bond face value — held in a non-interest-bearing escrow account at the surety.

For a $5M annual duty exposure, that's a $500K bond face value and a $250K–$500K cash collateral lock-up, earning **$0 yield**, for the full 12-month bond period and the typical re-underwriting drag — an industry-average **314 days**.

Then **the April 2025 reciprocal-tariff regime arrives**. Section 301 hikes. AD/CVD orders triggered by new product categories. Bond underflows trigger CBP release holds on incoming containers. Surety demands more cash collateral. Importer either tops up (a working-capital hit they didn't plan for) or watches freight pile up at port while detention & demurrage fees accrue.

The market evidence is unambiguous:

- **$3.6B** in customs-bond insufficiencies in FY2025 — **double 2019**
- **27,479** distinct insufficiency events (CBP public data)
- Surety premiums **up 200%** since April 2025; one auto importer reported a **550%** premium increase
- Industry-average collateral lock-up duration: **314 days** per bond cycle
- US continuous bonds in force: **~150,000**; aggregate bond face value: **~$10B**
- Annual US import duties + taxes + fees (post-tariff): **~$300B**

Assume importers post $5–10B in cash collateral every day across the market. At a conservative 4% T-bill yield, that's **$200–400M/year of forgone yield** — every year, recurring. Plus 2–6 week re-underwriting cycles every time tariffs move.

## The wedge

We don't replace the surety. We replace the *collateral instrument*.

A Soroban smart contract on Stellar:

1. Holds USDC instead of cash, on the importer's behalf
2. Hardcodes the surety's public key as clawback authority — so the surety's risk position is preserved
3. Earns yield via Franklin Templeton's BENJI tokenized T-bill (~4–5% APY; $270M+ TVL on Stellar already)
4. Exposes a permissionless `auto_top_up` function that moves shortfall from a reserve bucket to the collateral bucket atomically — no surety re-underwriting cycle, no port hold

The trust model unchanged: surety holds clawback authority on default. The cash mechanic changed: importer earns yield, top-ups are seconds not weeks.

| Stakeholder | Status quo | With TariffShield |
|---|---|---|
| Importer | $1.5M locked, $0 yield, 2–6 week top-up cycles | $1.5M locked, ~$67K/yr yield, seconds-fast top-ups |
| Surety | Holds collateral, manages spreadsheets, eats customer-service overhead | Holds clawback authority, sees portfolio dashboard, zero technology investment |
| CBP | Manual bond status monitoring | Same — CBP's relationship is with the surety; collateral instrument is internal |
| Platform | doesn't exist | 0.25–0.5% AUM, recurring |

Math on a 100-importer pilot:

- Average cash collateral: $1.5M per importer
- Pilot TVL: $150M
- Yield to importer (4.5% APY): $6.75M/yr — captured by importer, not platform
- Platform take (0.5% AUM): $750K ARR
- Scale path: 1,000 importers → $7.5M ARR; 10,000 importers → $75M ARR

## Why now

- **Soroban hit Stellar mainnet GA in March 2024.** The smart-contract surface needed for this product exists at protocol level, audited and stable.
- **BENJI is Stellar-native and at scale.** Franklin Templeton's tokenized T-bill fund has been on Stellar since 2023, crossed $270M TVL by 2025. The yield-bearing-collateral story is no longer hypothetical.
- **The Trump tariff regime started April 2025.** Bond insufficiencies doubled within nine months; surety premiums up 200%. The pain is acute *right now*.
- **Stablecoin Act of 2025** + **EU MiCA** create regulatory clarity for USDC-as-corporate-collateral that didn't exist 24 months ago. Treasurers can sign procurement orders for USDC products without three months of legal review.
- **CBP's ACE modernization roadmap (FY 2027)** explicitly mentions API-based bond status monitoring. The trade-data ecosystem is shifting toward real-time integration — bond collateral should match.

## Why Stellar specifically

- **KYC-aware asset issuance with clawback** is a native asset-model feature (`auth_required` + `clawback_enabled` flags). ERC-20 needs bolt-on legal contracts to approximate the same compliance posture; we get it for free.
- **BENJI is Stellar-native.** Integrating yield doesn't require a bridge.
- **Soroban transaction costs are $0.0001-class.** Auto-top-up events fire monthly per importer; even at 10,000 importers that's 120K events/year. Fees can't be a cost line.
- **The regulated-anchor ecosystem (SEP-31, SEP-12)** makes USD ↔ USDC on-ramps solvable on the importer-cash-out side. Coinbase Custody + Circle on the platform side; anchor partners for the importer's local fiat ramps.

## The honest gates

Four things stand between this MVP and a production business. We name them because hiding them doesn't make them go away.

### 1. Surety partnership

Roanoke, Avalon, GreatAmerican, Liberty Mutual are 100-year-old state-regulated insurance companies with 6–12 month deal cycles. We need a named surety partner in week 1 of go-to-market — without one, the platform exists but cannot channel to the importer book that already trusts a surety. This is sales work, not engineering work, and runs in parallel.

### 2. CBP ACE API access

CBP's Automated Commercial Environment Secure Data Portal is not publicly accessible. Live tariff exposure data requires either importer-side OAuth (compliance friction the importer's customs broker will object to) or surety-side relay via their existing reporting access. Same gate as #1. The MVP uses CSV upload to demonstrate the data flow.

### 3. Real BENJI integration

Franklin Templeton's tokenized T-bill is already on Stellar at $270M+ TVL but routing real fund flow into and out of TariffShield requires a custody agreement with Franklin Templeton. MVP simulates yield accrual on-chain with the platform admin recording yield events; mainnet wires the real fund flow.

### 4. State-by-state insurance regulator approval

Sureties are regulated in every US state separately. Changing the collateral instrument backing a CBP bond is an insurance question (not just a CBP question). The MVP cleanly avoids this gate by using USDC *alongside* the existing surety relationship rather than replacing the bond itself. Long-term, full bond-on-chain requires per-state regulator engagement — a 1–3 year roadmap item.

## Differentiation

| Player | What they sell | Our positioning |
|---|---|---|
| **Roanoke / Avalon / GreatAmerican** | Traditional cash-collateralized surety | We partner with them — we are not a competitor surety. Surety keeps the bond + the premium income |
| **Software-only surety SaaS** | Workflow automation (PDF + email) | We replace the *collateral instrument* itself, not the workflow |
| **Yield-bearing business checking (Mercury, Brex)** | High-yield generic operating cash | We are customs-specific: programmable top-ups, surety-side clawback, regulatory posture matched to surety needs |
| **On-chain treasury (Anchorage, Fireblocks)** | Crypto-native treasury custody | We target traditional importer CFOs, not crypto-native companies. The importer never holds a wallet; the platform holds the contract admin key |

## Why a small team can ship this

- The Soroban contract is **one file, 8 entrypoints, 14 cargo tests, 12,284 bytes of optimized wasm**. That's a focused week of Rust work after toolchain setup.
- The API + web layer is conventional Express + Next.js + Postgres — well-understood territory.
- No multi-party crypto custody. Platform holds the contract admin key + surety holds the clawback key + importer holds their own deposit key. Three-party trust model is the whole architecture.
- No mainnet money movement. Testnet demo + scoped contributor issues for production.
- No new clearing rail. CBP keeps its relationship with the surety; nothing about the importer's bond-with-CBP changes.

## What ships in this repository

- A deployed Soroban contract on Stellar — [`CBLASRVG7NRAFP2CDPVSF4WTJBKC6L4FKT2XHR3OH7CLICUBPVQ4PBBF`](https://stellar.expert/explorer/testnet/contract/CBLASRVG7NRAFP2CDPVSF4WTJBKC6L4FKT2XHR3OH7CLICUBPVQ4PBBF)
- 8 entrypoints + 14 passing cargo unit tests + 12KB optimized wasm
- A TypeScript SDK wrapping the contract over Soroban RPC
- An Express API + Postgres mirror with mock CBP CSV ingestion
- A Next.js dashboard with separate importer + surety admin surfaces
- Fully verified end-to-end happy path on testnet: importer signup → friendbot fund → register on-chain → deposit collateral + reserve → simulated tariff spike → auto-top-up → simulated yield → surety clawback (every step has an explorer-linked tx hash in `deployments.json`)
- A 16-item roadmap of scoped, contributor-friendly tasks for production hardening

---

[← README](./README.md) · [Architecture →](./ARCHITECTURE.md)
