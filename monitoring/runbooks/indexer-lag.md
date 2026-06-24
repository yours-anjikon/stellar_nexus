# Runbook: TariffShield Contract Event Indexer Lag

## Overview
This runbook covers how to respond to `ContractEventIndexerHighLag` and `ContractEventIndexerStalled` alerts. The event indexer processes Stellar/Soroban ledger events to ensure the TariffShield PostgreSQL database mirrors the on-chain customs bond state.

## Alerting Symptoms
- **ContractEventIndexerHighLag**: The event indexer is lagging by more than 10 blocks (ledgers) behind the chain tip for over 2 minutes.
- **ContractEventIndexerStalled**: The indexer lag is positive and has not decreased for more than 5 minutes, indicating that the indexer cycle is stuck or stalled.

---

## Step 1: Diagnose Current Indexer Lag

### Option A: Check Prometheus Metrics
Run the following query in your Prometheus console:
```promql
contract_event_indexer_lag_ledgers
```
A value > 10 confirms active data drift. If the graph is linear and increasing, the indexer is completely stuck.

### Option B: Check Database State
Connect to the PostgreSQL instance and inspect the current indexer state:
```sql
SELECT id, last_processed_ledger, updated_at FROM indexer_state;
```
Compare this against the current ledger sequence on the Stellar network (accessible via Horizon or Soroban RPC).

### Option C: Check Application Logs
Inspect the Express API container logs. Filter for structured logging tags:
- Search for levels `40` (Warn) or `50` (Error).
- Look for key fields like `lagLedgers`, `lastProcessedLedger`, and `currentLedger` to identify exactly when the indexer started falling behind.

---

## Step 2: Replay Missed Ledgers

If the indexer crashed or missed events due to transient network failures, you can manually reset its progress to trigger a catch-up replay.

1. **Verify network liveness**: Check that the Soroban RPC provider is healthy and responding to queries.
2. **Determine restart point**: Identify the last known safe ledger sequence (before the lag or drift occurred).
3. **Reset indexer state**: Execute an update query in the database to point the indexer to the desired historical ledger:
   ```sql
   UPDATE indexer_state
   SET last_processed_ledger = <safe_ledger_sequence>, updated_at = now()
   WHERE id = 'default';
   ```
4. **Restart indexer service**: Restart the API or indexer process:
   ```bash
   # If running in Docker Compose
   docker compose restart api
   ```
5. **Monitor progression**: Verify that the database updates successfully and the lag starts decreasing.

---

## Step 3: Escalation Paths

Escalate the incident to the On-Call DevOps or Lead Smart Contract Engineer if:
- Restarting the process and resetting the ledger sequence does not reduce the lag.
- The indexer crashes repeatedly immediately after booting, indicating a malformed event payload on-chain that cannot be parsed.
- The Soroban RPC node is unresponsive or returning persistent rate limits/HTTP 500 errors.
