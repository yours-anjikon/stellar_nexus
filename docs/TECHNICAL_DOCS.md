# 🛠️ Stellar Nexus Technical Documentation

Welcome to the technical deep-dive of Stellar Nexus. This document serves as a guide for developers and judges to understand the architecture, contract logic, and integration patterns used in the project.

---

## 🏗️ System Architecture

Stellar Nexus is built as a three-tier system:

1.  **Frontend (UI/UX)**: Next.js 16 application styled with Vanilla CSS and Tailwind. It manages wallet connections (Freighter), transaction building, and the execution environment.
2.  **Smart Contracts (Soroban)**: A suite of Rust contracts handling the marketplace logic, token transfers, and serverless applet execution.
3.  **AI Engine (Inference)**: A Node.js backend that interfaces with a fine-tuned Llama 3 model to assist in contract generation.

---

## 📜 Smart Contract Logic

### Marketplace Contract
- **Storage**: Uses `Persistent` storage for listing data and `Temporary` storage for session-based states.
- **Functions**:
    - `list_applet(owner: Address, name: String, code_uri: String, price: u64)`: Registers a new logic unit.
    - `buy_applet(buyer: Address, applet_id: u64)`: Orchestrates the payment via XLM and grants access.
    - `execute_applet(args: Vec<Val>)`: Proxies execution to the target applet (in development).

### Fee Sponsorship (Advanced Feature)
We leverage Stellar's **Fee Bump** transactions. When "Gasless Mode" is enabled:
1. The frontend builds the inner transaction (the contract call).
2. It sends the XDR to our sponsorship service.
3. The service wraps it in a Fee Bump transaction, signed by the Nexus Treasury.
4. The final transaction is submitted to the network, with fees paid by Nexus.

---

## 🏃 User Guide

### For Developers (Sellers)
1. Use the **AI Nexus** assistant to generate a Soroban contract.
2. Deploy your contract to the Stellar Testnet.
3. Go to **"Go Live"** and list your contract by providing its Address and Metadata.
4. Set a price in XLM and start earning!

### For Users (Buyers)
1. Connect your **Freighter Wallet**.
2. Browse the **Marketplace** for useful applets.
3. Use **"Gasless Mode"** if you don't have XLM for fees.
4. Execute applets directly in the browser or download the source code for your own projects.

---

## 🔍 Data Indexing Approach

To provide a real-time experience without waiting for Horizon's latency, we implemented a **Polling Indexer**:
- It monitors the `nexus-marketplace` contract address for new `contract_event` emissions.
- Events are parsed into structured JSON and stored in a memory cache.
- The **Metrics Dashboard** fetches this cache to display live activity.

---

## 🛠️ Installation & Setup

```bash
# Clone
git clone https://github.com/Srizdebnath/stellar-nexus.git

# Frontend
cd frontend
npm install
npm run dev

# Contracts
cd contracts/nexus
cargo test
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/nexus.wasm --source alice --network testnet
```

---

## 📡 API Endpoints

- **Metrics API**: `GET /api/stats` (Aggregated platform metrics)
- **AI Generator**: `POST /api/generate` (Llama 3 integration)
- **Indexer**: `GET /api/events` (Live contract events)
