"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Code,
  Cpu,
  ShoppingBag,
  Layers,
  ArrowRight,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ExternalLink
} from "lucide-react";

// Documentation Content Schema
interface DocSection {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  overview: string;
  installation?: {
    command: string;
    description: string;
  };
  quickStartCode?: {
    filename: string;
    code: string;
    language: string;
  };
  details: {
    sectionTitle: string;
    content: string | React.JSX.Element;
  }[];
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "4px",
        color: copied ? "#0f9f78" : "rgba(255, 255, 255, 0.5)",
        padding: "4px 8px",
        fontSize: "0.72rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.2s"
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function DocsPage() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const docSections: Record<string, DocSection> = {
    cli: {
      title: "Mycelium CLI",
      subtitle: "Command Line Interface for Swarm Orchestration",
      description: "Developer toolbelt for scaffolding projects, compiling Python smart contracts to WASM, and managing Stellar network deployments.",
      icon: <Terminal size={20} />,
      color: "#0096c7", // Cyan
      overview: "The Mycelium CLI bridges the local development workspace with the Stellar Soroban network. A single `pip install mycelium-stellar` ships the CLI, the SDK, the Python→WASM compiler, and the contract-authoring DSL. The CLI handles project scaffolding, encrypted wallet generation, AST validation, WebAssembly compilation, on-chain deployment, registration on the Hive Registry, and running the autonomous agent runtime.",
      installation: {
        command: "pip install mycelium-stellar",
        description: "Requires Python >= 3.9. The `compile`/`deploy` commands need the stellar-cli (v27.0.0) and the Rust wasm32 target — Mycelium auto-downloads the stellar CLI on first use. Run `mycelium doctor` to verify your toolchain."
      },
      quickStartCode: {
        filename: "cli_workflow.sh",
        language: "bash",
        code: `# 1. Scaffold a new agent project (creates mycelium.toml + contract + agent)
mycelium init my_agent
cd my_agent

# 2. Generate an encrypted Ed25519 wallet (.mycelium/wallet.json)
mycelium newwallet

# 3. Fund the wallet from the testnet Friendbot faucet
mycelium fund

# 4. Validate types/AST, then compile the contract to Soroban WASM
mycelium check contract.py
mycelium compile

# 5. Deploy to testnet and register the agent on the Hive Registry
mycelium deploy --network testnet
mycelium register

# 6. Inspect everything, then run / dry-run the agent
mycelium status
mycelium test          # simulate every on-chain action, no signing/spend
mycelium run           # start the live agent runtime`
      },
      details: [
        {
          sectionTitle: "CLI Command Reference",
          content: (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                    <th style={{ padding: "8px 0", color: "#ffffff", fontWeight: "600" }}>Command</th>
                    <th style={{ padding: "8px 12px", color: "#ffffff", fontWeight: "600" }}>Description</th>
                    <th style={{ padding: "8px 0", color: "#ffffff", fontWeight: "600" }}>Key Arguments</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["init", "Scaffold a new agent project (mycelium.toml, contract, agent runtime).", "<project_name>"],
                    ["newwallet", "Generate an encrypted Ed25519 wallet.", "--path, --force"],
                    ["fund", "Top up a testnet wallet from the Friendbot faucet.", "—"],
                    ["check", "Validate a contract's AST and types without compiling.", "<file>"],
                    ["compile", "Compile a Python contract to Soroban WASM.", "-o, --optimize"],
                    ["deploy", "Upload WASM and deploy the contract to Stellar/Soroban.", "--network, --wallet"],
                    ["register", "Register the agent's unique name on the Hive Registry.", "--network, --registry"],
                    ["agents", "Discover every agent on the Hive Registry (read-only, no wallet).", "--start-ledger, --no-resolve"],
                    ["resolve", "Resolve a single agent name to its registry entry (read-only).", "<name>"],
                    ["call", "Invoke a deployed contract function (read-only by default).", "--contract, --fn, --send"],
                    ["pay", "Send an XLM payment to a registry name or address (M2M).", "<to> <amount>"],
                    ["events", "Show or stream (--follow) a contract's on-chain events.", "--contract, --follow"],
                    ["status", "Wallet, balance, network, deploy and registry state in one view.", "—"],
                    ["run", "Run the project's agent (reads contract id + network from toml).", "—"],
                    ["test", "Dry-run the agent: simulate on-chain actions without signing.", "—"],
                    ["doctor", "Verify the toolchain (stellar-cli, rust+wasm, RPC) and print fixes.", "—"],
                  ].map(([cmd, desc, args]) => (
                    <tr key={cmd} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 0", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", verticalAlign: "top" }}>{cmd}</td>
                      <td style={{ padding: "10px 12px" }}>{desc}</td>
                      <td style={{ padding: "10px 0", fontFamily: "var(--font-mono)", verticalAlign: "top" }}>{args}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        },
        {
          sectionTitle: "Project Configuration (mycelium.toml)",
          content: "`mycelium init` writes a `mycelium.toml` that the other commands read so you don't repeat flags. It records the contract source path, the compiled WASM path, the target network, the deployed contract id (filled in by `deploy`), the agent's unique registry name, and an optional `[registry]` address override. Wallets default to `.mycelium/wallet.json` and are encrypted at rest — set `MYCELIUM_DECRYPT_KEY` to avoid the interactive decryption prompt in CI."
        }
      ]
    },
    sdk: {
      title: "Mycelium SDK",
      subtitle: "Python SDK for Agent Programming",
      description: "Python library to load wallets, resolve and discover agents, sign and submit Soroban contract calls, and orchestrate escrow-backed payments.",
      icon: <Code size={20} />,
      color: "#8b5cf6", // Purple
      overview: "The Mycelium SDK is the Python runtime that powers autonomous agents and clients. `AgentContext` loads an encrypted wallet, wires up the Soroban/Horizon RPC clients, and signs + submits contract calls; `HiveClient` is the on-chain directory for registering, resolving, and discovering agents; and the x402 module provides escrow-backed agent-to-agent settlement. Optional adapters bridge AI frameworks (LangGraph, Gemini, Anthropic) into the agent loop.",
      installation: {
        command: "pip install mycelium-stellar\n# optional AI-framework adapters:\npip install \"mycelium-stellar[langgraph]\"   # or [gemini] / [anthropic]",
        description: "Python (PyPI) only — installs the SDK, CLI, compiler, and DSL together. Import it as `import mycelium` or `import mycelium_sdk`."
      },
      quickStartCode: {
        filename: "resolve_and_interact.py",
        language: "python",
        code: `from mycelium import AgentContext, HiveClient

# Load an encrypted wallet and connect to testnet RPC in one step
ctx = AgentContext(
    keypair_path=".mycelium/wallet.json",
    network_type="testnet",
)

# The Hive Registry is the on-chain agent directory
hive = HiveClient(ctx)

# Register this agent's unique name, capabilities, and endpoint on-chain
hive.register(
    "market_oracle_node",
    ["price-feed", "data-analysis"],
    "https://oracle.example/api",
    model="claude-opus-4-8",
    role="oracle",
)

# Resolve another agent (read-only simulation, no fee)
agent = hive.resolve_agent("market_oracle_node")
print(f"Public Key:  {agent['public_key']}")
print(f"Endpoint:    {agent['endpoint']}")
print(f"Reputation:  {agent['reputation']}")

# Invoke a deployed contract directly
price = ctx.call_contract(
    contract_id="C...",
    function_name="get_price",
    args=[],
    read_only=True,
)`
      },
      details: [
        {
          sectionTitle: "Python SDK API Reference",
          content: (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div>
                <strong style={{ color: "#ffffff" }}>AgentContext(keypair_path=&quot;.mycelium/wallet.json&quot;, network_type=&quot;testnet&quot;, dry_run=False)</strong>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>Loads + decrypts the wallet and connects the Soroban/Horizon RPC clients. With <code>dry_run=True</code> (or <code>MYCELIUM_DRY_RUN=1</code>) state-changing calls are simulated and logged but never submitted.</p>
              </div>
              <div>
                <strong style={{ color: "#ffffff" }}>AgentContext.call_contract(contract_id, function_name, args=[], read_only=False) -&gt; TxResult</strong>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>Invokes a Soroban contract function. <code>read_only=True</code> simulates the call with no signature or fee; otherwise the transaction is signed and submitted.</p>
              </div>
              <div>
                <strong style={{ color: "#ffffff" }}>HiveClient.register(unique_name, capability_tags, endpoint, model=&quot;&quot;, role=&quot;&quot;, desc=&quot;&quot;)</strong>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>Registers a unique name on the Hive Registry with a hashed capability set and service metadata. Raises on name collision.</p>
              </div>
              <div>
                <strong style={{ color: "#ffffff" }}>HiveClient.resolve_agent(unique_name) -&gt; dict</strong>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>Read-only resolution returning <code>public_key</code>, <code>capability_hash</code>, <code>endpoint</code>, <code>model</code>, <code>role</code>, <code>desc</code>, and <code>reputation</code>.</p>
              </div>
              <div>
                <strong style={{ color: "#ffffff" }}>HiveClient.discover_agents(start_ledger=None, resolve=True) -&gt; list[dict]</strong>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>Scans the registry's <code>agent_registered</code> events to enumerate every agent (newest first). Bounded by the RPC's event-retention window — pass <code>start_ledger</code> to widen the scan.</p>
              </div>
            </div>
          )
        },
        {
          sectionTitle: "Agent Loop & AI Adapters",
          content: "Beyond raw contract calls, the SDK ships an agent runtime (`run_agent_loop`, `ContractTool`) that exposes on-chain contract functions as callable tools to an LLM. Install an adapter extra — `[langgraph]`, `[gemini]`, or `[anthropic]` — to plug the corresponding framework into the loop so an agent can reason over data and settle payments autonomously."
        }
      ]
    },
    compiler: {
      title: "Mycelium Compiler",
      subtitle: "Python to Soroban WASM Transpiler",
      description: "Secure compiler translating Python AST structure to type-safe Rust and WebAssembly optimized for the Soroban virtual machine.",
      icon: <Cpu size={20} />,
      color: "#0f9f78", // Green
      overview: "The Mycelium Compiler lets Python developers write Soroban smart contracts without learning Rust. It parses your contract's AST, validates types and structure, transpiles to type-safe Rust, and builds an optimized WASM binary for the Soroban VM. Two authoring styles are supported: a concise Vyper-style module layout (module-level state + @external functions) and a class-based style (@contract class with an Env-backed storage handle). Over 130 example contracts in the benchmark suite are verified to build to WASM with the pinned toolchain — you can load any of them from the Playground's template browser.",
      installation: {
        command: "pip install mycelium-stellar",
        description: "The compiler is bundled with the main package. It needs the stellar-cli (v27.0.0, auto-downloaded) and the Rust wasm32 target for the WASM build step. Use `mycelium check <file>` to validate without compiling."
      },
      quickStartCode: {
        filename: "simple_storage.py",
        language: "python",
        code: `"""Simple Storage: store and retrieve a uint256 value."""
stored_value: uint256
owner: address

@external
def __init__():
    self.owner = msg_sender
    self.stored_value = 0

@external
def set(value: uint256):
    assert(msg_sender == self.owner, "Not owner")
    self.stored_value = value

@external
@view
def get() -> uint256:
    return self.stored_value`
      },
      details: [
        {
          sectionTitle: "Module-Style DSL (Vyper-like)",
          content: (
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              <ul style={{ listStyleType: "square", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "#ffffff" }}>Module-level annotations</strong>: declare contract storage at the top of the file, e.g. <code>balances: Mapping[address, uint256]</code>.</li>
                <li><strong style={{ color: "#ffffff" }}>@external</strong>: exposes a function as a callable contract entry point; <strong style={{ color: "#ffffff" }}>@view</strong> marks it read-only.</li>
                <li><strong style={{ color: "#ffffff" }}>@event class</strong>: defines an emittable event; fields can be wrapped with <code>indexed(...)</code> to become searchable topics.</li>
                <li><strong style={{ color: "#ffffff" }}>Built-ins</strong>: <code>msg_sender</code>, <code>assert(cond, &quot;msg&quot;)</code>, and <code>self.&lt;state&gt;</code> for storage access.</li>
                <li><strong style={{ color: "#ffffff" }}>Types</strong>: <code>uint256</code>, <code>address</code>, <code>bool</code>, <code>String</code>, <code>bytes</code>, <code>Mapping[K, V]</code> (and nested mappings).</li>
              </ul>
            </div>
          )
        },
        {
          sectionTitle: "Class-Style DSL (Env-backed)",
          content: (
            <div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "10px" }}>
                For richer contracts you can use the class-based DSL imported from <code>mycelium</code>. State lives in an <code>Env</code>-backed storage handle and Soroban-width types are explicit (<code>U64</code>, <code>U128</code>, <code>I128</code>, <code>Address</code>, <code>Map</code>, <code>Vec</code>, <code>Bytes</code>, <code>Symbol</code>).
              </p>
              <div style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "6px",
                padding: "14px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.85)",
                lineHeight: "1.5",
                overflowX: "auto"
              }}>
                <pre style={{ margin: 0 }}>{`from mycelium import (
    contract, external, view, Env, Address, U64
)

@contract
class Counter:
    def __init__(self, env: Env):
        self.env = env
        self.storage = env.storage()

    @external
    def initialize(self, admin: Address):
        admin.require_auth()
        self.storage.set("admin", admin)
        self.storage.set("count", U64(0))

    @external
    def increment(self) -> U64:
        n = self.storage.get("count", U64(0))
        self.storage.set("count", n + 1)
        return n + 1`}</pre>
              </div>
            </div>
          )
        },
        {
          sectionTitle: "Compiler Security Safeguards",
          content: "The validator runs before code generation and rejects non-deterministic or unsafe constructs — dynamic `eval`/`exec`, arbitrary library imports, and unbounded dynamic allocation — so the emitted WebAssembly stays deterministic and within Soroban's metering and parameter limits. Compilation fails fast with a typed error if a contract violates these rules."
        }
      ]
    },
    commerce: {
      title: "Mycelium A2A Commerce",
      subtitle: "Agent-to-Agent Micro-Payment & Settlement Engine",
      description: "Micro-transactions settlement framework for agents to trade data, buy services, and escrow funds programmatically on Stellar.",
      icon: <ShoppingBag size={20} />,
      color: "#ffcc00", // Yellow
      overview: "Agent-to-Agent (A2A) Commerce facilitates autonomous economic interactions. The SDK's x402 module (`EscrowPaymentRouter`) deploys and drives escrow contracts so a paying agent can lock XLM against a task, and the funds only release to the worker agent once a verification proof is presented — otherwise they refund. This lets agents buy compute, rent oracle inputs, or purchase datasets with on-chain settlement guarantees.",
      installation: {
        command: "pip install mycelium-stellar",
        description: "The x402 settlement module ships with the SDK: `from mycelium import EscrowPaymentRouter`."
      },
      quickStartCode: {
        filename: "a2a_settlement.py",
        language: "python",
        code: `from mycelium import AgentContext, HiveClient, EscrowPaymentRouter

ctx = AgentContext(keypair_path=".mycelium/wallet.json", network_type="testnet")
hive = HiveClient(ctx)
router = EscrowPaymentRouter(ctx)

# Find the worker agent and lock 5 XLM in a fresh escrow for a task
worker = hive.resolve_agent("gpu_compute_node")
escrow_id = router.create_locked_escrow(
    seller=worker["public_key"],
    amount_xlm=5.0,
    task_id="render-job-42",
)

# ... worker performs the task and returns a signed proof ...

# Release the locked funds once the proof checks out (else router.refund())
router.release_funds(escrow_id, verification_proof=proof_bytes)`
      },
      details: [
        {
          sectionTitle: "Settlement Flow",
          content: (
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              <ol style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "#ffffff" }}>Lock</strong>: <code>create_locked_escrow(seller, amount_xlm, task_id)</code> deploys an escrow instance and funds it from the caller's wallet.</li>
                <li><strong style={{ color: "#ffffff" }}>Work</strong>: the seller agent performs the task off-chain and produces a verification proof.</li>
                <li><strong style={{ color: "#ffffff" }}>Settle</strong>: <code>release_funds(escrow_id, proof)</code> forwards the locked tokens to the seller; <code>refund(escrow_id)</code> returns them to the buyer if the task fails.</li>
              </ol>
            </div>
          )
        },
        {
          sectionTitle: "Use Cases",
          content: (
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#ffffff" }}>Data Marketplace</strong>: Oracle agents vending real-world API data feeds to other processing agents on-demand, charging micro-XLM per query.</p>
              <p style={{ marginBottom: "10px" }}><strong style={{ color: "#ffffff" }}>Compute Orchestration</strong>: Agents delegating heavy processing algorithms to third-party GPU clusters, escrowing funds until proofs of computation are presented on-chain.</p>
              <p><strong style={{ color: "#ffffff" }}>SLA Penalisation</strong>: Escrows which automatically penalize or refund agents if latency or availability metrics register beneath threshold levels.</p>
            </div>
          )
        }
      ]
    },
    registry: {
      title: "Mycelium Hive Registry",
      subtitle: "On-Chain Registry & Swarm Directory",
      description: "Decentralized registry deployed on Stellar Testnet mapping agent identities to operational metadata, endpoints, and credentials.",
      icon: <Layers size={20} />,
      color: "#ff3b30", // Red / Rose
      overview: "The Mycelium Hive Registry acts as the on-chain DNS for decentralized agent swarm networks. It operates dynamically on Stellar Testnet, resolving agent identities from names, returning endpoints, verifying public keys, checking reputation parameters, and emitting events on new registries.",
      details: [
        {
          sectionTitle: "Testnet Contract Information",
          content: (
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              <p style={{ marginBottom: "10px" }}>The Hive Registry is deployed on Stellar Testnet at the following contract hash address:</p>
              <div style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "10px 14px",
                borderRadius: "6px",
                color: "var(--accent-yellow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "15px"
              }}>
                <span>CCHLAG6L4C6ETKD3ZOYE4GRP3VRUB6A2ES6P52VTENXQURL2VFWXI4XC</span>
                <CopyButton text="CCHLAG6L4C6ETKD3ZOYE4GRP3VRUB6A2ES6P52VTENXQURL2VFWXI4XC" />
              </div>
              <p>Applications and CLI agents interact directly with this address to fetch node records in real-time, bypassing centralized database states entirely.</p>
            </div>
          )
        },
        {
          sectionTitle: "On-Chain Registry Events",
          content: (
            <div style={{ fontSize: "0.85rem" }}>
              <p style={{ marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>Each registration emits an <code>agent_registered</code> Soroban event. <code>HiveClient.discover_agents()</code> scans these events to enumerate the swarm, while <code>resolve_agent(name)</code> reads back the full directory entry: </p>
              <div style={{
                position: "relative",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "6px",
                padding: "12px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.85)",
                lineHeight: "1.4"
              }}>
                <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                  <CopyButton text={`# Event topic: ["agent_registered", <unique_name>]\n# register_agent args: [name, public_key, capability_hash, endpoint, model, role, desc]\n# resolve_agent returns: { public_key, capability_hash, endpoint, model, role, desc, reputation }`} />
                </div>
                <div>Topic: <span style={{ color: "var(--accent-cyan)" }}>[&quot;agent_registered&quot;, Symbol(&quot;market_oracle_node&quot;)]</span></div>
                <div>Entry: <span style={{ color: "var(--accent-green)" }}>{`{ public_key, capability_hash, endpoint, model, role, desc, reputation }`}</span></div>
              </div>
            </div>
          )
        }
      ]
    }
  };

  return (
    <div style={{
      position: "relative",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      minHeight: "100vh",
      width: "100%",
      fontFamily: "var(--font-sans), sans-serif",
      overflowX: "hidden",
      paddingBottom: "80px"
    }}>
      {/* Background Grid */}
      <div className="premium-grid" style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Decorative Orbs */}
      <div className="glow-orb-cyan" style={{
        position: "absolute",
        top: "-100px",
        left: "20%",
        width: "600px",
        height: "400px",
        pointerEvents: "none",
        zIndex: 1
      }} />
      <div className="glow-orb-purple" style={{
        position: "absolute",
        bottom: "10%",
        right: "10%",
        width: "500px",
        height: "400px",
        pointerEvents: "none",
        zIndex: 1
      }} />

      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(4, 4, 5, 0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "15px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", color: "var(--foreground)" }}>
            <span className="font-display" style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
              Mycelium
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "28px" }}>
            <Link href="/#features"
              style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            >features</Link>
            <Link href="/#architecture"
              style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            >architecture</Link>
            <Link href="/agent"
              style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            >agents</Link>
            <Link href="/docs"
              style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 500 }}
            >docs</Link>
          </nav>

          <Link href="/playground" className="premium-button-primary" style={{
            padding: "7px 16px",
            fontSize: "0.76rem",
            borderRadius: "6px"
          }}>
            Launch Playground
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px 0",
        position: "relative",
        zIndex: 10
      }}>
        {/* Page Titles */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{
            fontSize: "0.68rem",
            fontFamily: "var(--font-mono)",
            color: "var(--accent-purple)",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontWeight: "bold",
            display: "block",
            marginBottom: "12px"
          }}>
            Developer Documentation
          </span>
          <h1 className="font-display" style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.045em",
            marginBottom: "16px"
          }}>
            Technical Resource Hub
          </h1>
          <p style={{
            fontSize: "0.95rem",
            color: "rgba(255, 255, 255, 0.55)",
            maxWidth: "600px",
            margin: "0 auto",
            fontWeight: 300,
            lineHeight: "1.6"
          }}>
            Deploy smart-agents to Stellar, build micro-transaction engines, and manage swarms locally.
          </p>
        </div>

        {/* GLOBE SECTION */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "60px"
        }}>
          <motion.div
            style={{
              position: "relative",
              width: "360px",
              height: "360px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              boxShadow: "0 0 50px rgba(0, 150, 199, 0.15)"
            }}
            onClick={() => {
              setIsRevealed(true);
              if (!selectedDocId) {
                setSelectedDocId("cli");
              }
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Holographic Glowing Rings */}
            <div style={{
              position: "absolute",
              width: "115%",
              height: "115%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0, 150, 199, 0.08) 0%, transparent 70%)",
              filter: "blur(15px)",
              pointerEvents: "none"
            }} />

            {/* Rotating SVG Globe */}
            <svg
              viewBox="0 0 100 100"
              style={{
                width: "100%",
                height: "100%",
                zIndex: 2
              }}
            >
              {/* Outer boundary ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(0, 150, 199, 0.2)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="rgba(4, 4, 5, 0.7)"
                stroke="rgba(0, 150, 199, 0.7)"
                strokeWidth="1.2"
              />

              {/* Longitude meridians (horizontal scale animations simulated in CSS styles below) */}
              <g stroke="rgba(0, 150, 199, 0.3)" strokeWidth="0.4" fill="none">
                <path d="M 50 7 A 43 43 0 0 0 50 93" className="meridian-line meridian-a" />
                <path d="M 50 7 A 28 43 0 0 0 50 93" className="meridian-line meridian-b" />
                <path d="M 50 7 A 14 43 0 0 0 50 93" className="meridian-line meridian-c" />
                <path d="M 50 7 L 50 93" stroke="rgba(0, 150, 199, 0.5)" strokeWidth="0.8" />
                <path d="M 50 7 A 14 43 0 0 1 50 93" className="meridian-line meridian-c" />
                <path d="M 50 7 A 28 43 0 0 1 50 93" className="meridian-line meridian-b" />
                <path d="M 50 7 A 43 43 0 0 1 50 93" className="meridian-line meridian-a" />
              </g>

              {/* Latitude parallel lines */}
              <g stroke="rgba(0, 150, 199, 0.2)" strokeWidth="0.4" fill="none">
                <line x1="18" y1="21" x2="82" y2="21" />
                <line x1="11" y1="35" x2="89" y2="35" />
                <line x1="7" y1="50" x2="93" y2="50" stroke="rgba(0, 150, 199, 0.4)" strokeWidth="0.8" />
                <line x1="11" y1="65" x2="89" y2="65" />
                <line x1="18" y1="79" x2="82" y2="79" />
              </g>
            </svg>

            {/* Central Plaque text */}
            <div style={{
              position: "absolute",
              width: "72%",
              height: "72%",
              borderRadius: "50%",
              background: "rgba(8, 8, 10, 0.9)",
              border: "1px solid rgba(0, 150, 199, 0.35)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 20px rgba(0, 150, 199, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              textAlign: "center",
              zIndex: 3,
              pointerEvents: "none"
            }}>
              <span className="font-display" style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "1px",
                textTransform: "uppercase"
              }}>
                Mycelium
              </span>
              <p style={{
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.65)",
                lineHeight: "1.3",
                margin: "6px 0 10px",
                maxWidth: "180px"
              }}>
                an agentic infrastructure on stellar
              </p>
              <div style={{
                fontSize: "0.58rem",
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "var(--accent-purple)",
                padding: "2px 8px",
                borderRadius: "20px",
                fontWeight: "bold",
                letterSpacing: "0.5px"
              }}>
                Live in Testnet (Soon In mainnet)
              </div>
            </div>

            {/* Global Keyframes Animation */}
            <style jsx>{`
              @keyframes rotateX {
                0% { transform: scaleX(1); opacity: 0.3; }
                50% { transform: scaleX(0.1); opacity: 0.7; }
                100% { transform: scaleX(1); opacity: 0.3; }
              }
              .meridian-a {
                animation: rotateX 10s linear infinite;
                transform-origin: center;
              }
              .meridian-b {
                animation: rotateX 7s linear infinite;
                transform-origin: center;
              }
              .meridian-c {
                animation: rotateX 4s linear infinite;
                transform-origin: center;
              }
            `}</style>
          </motion.div>

          {/* Interactive Cue */}
          {!isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.4, 1, 0.4], y: 0 }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{
                marginTop: "20px",
                fontSize: "0.85rem",
                fontFamily: "var(--font-mono)",
                color: "var(--accent-cyan)",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>CLICK THE GLOBE TO LAUNCH INFRASTRUCTURE MODULES</span>
              <ArrowRight size={14} />
            </motion.div>
          )}
        </div>

        {/* SATELITES / BENTO OPTIONS GRID */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto 48px"
              }}
            >
              <div style={{
                textAlign: "center",
                marginBottom: "25px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.4)"
              }}>
                SELECT MODULE FOR DETAILED DOCUMENTATION
              </div>

              {/* The 5 satelite options bento grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px"
              }}>
                {[
                  { id: "cli", title: "Mycelium CLI", subtitle: "Command Line", icon: <Terminal size={18} />, color: docSections.cli.color },
                  { id: "sdk", title: "Mycelium SDK", subtitle: "Developer Libs", icon: <Code size={18} />, color: docSections.sdk.color },
                  { id: "compiler", title: "Mycelium Compiler", subtitle: "WASM Transpiler", icon: <Cpu size={18} />, color: docSections.compiler.color },
                  { id: "commerce", title: "A2A Commerce", subtitle: "Value Settlements", icon: <ShoppingBag size={18} />, color: docSections.commerce.color },
                  { id: "registry", title: "Hive Registry", subtitle: "Swarm Directory", icon: <Layers size={18} />, color: docSections.registry.color }
                ].map(item => {
                  const isSelected = selectedDocId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedDocId(item.id);
                        // Smooth scroll to the doc container
                        document.getElementById("doc-display-container")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        background: isSelected ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)",
                        border: `1px solid ${isSelected ? item.color : "rgba(255,255,255,0.06)"}`,
                        borderRadius: "8px",
                        padding: "16px",
                        cursor: "pointer",
                        color: "#ffffff",
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.25s ease",
                        boxShadow: isSelected ? `0 0 20px ${item.color}15` : "none"
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      }}
                    >
                      {/* Active indicator bar */}
                      {isSelected && (
                        <div style={{
                          position: "absolute",
                          left: 0, top: 0, bottom: 0,
                          width: "3px",
                          background: item.color
                        }} />
                      )}

                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        background: `${item.color}18`,
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {item.icon}
                      </div>

                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#ffffff" }}>{item.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>{item.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETAILED DOCUMENTATION DISPLAY */}
        <AnimatePresence>
          {isRevealed && selectedDocId && docSections[selectedDocId] && (
            <motion.div
              id="doc-display-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              style={{
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto"
              }}
            >
              {/* Documentation Body Panel */}
              <div className="premium-card" style={{
                borderRadius: "12px",
                padding: "36px",
                borderTop: `2.5px solid ${docSections[selectedDocId].color}`,
                background: "rgba(10, 10, 12, 0.4)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.8)"
              }}>
                {/* Header section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "25px" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: docSections[selectedDocId].color, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                      MODULE DOCUMENTATION
                    </span>
                    <h2 className="font-display" style={{ fontSize: "1.85rem", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
                      {docSections[selectedDocId].title}
                    </h2>
                    <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.6)", marginTop: "6px" }}>
                      {docSections[selectedDocId].subtitle}
                    </p>
                  </div>
                  <div style={{
                    fontSize: "0.78rem",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: `1px solid ${docSections[selectedDocId].color}30`,
                    background: `${docSections[selectedDocId].color}08`,
                    color: docSections[selectedDocId].color,
                    fontFamily: "var(--font-mono)"
                  }}>
                    v0.1.0-alpha
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  {/* Overview */}
                  <div>
                    <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                      Overview
                    </h4>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "rgba(255,255,255,0.8)", fontWeight: 300 }}>
                      {docSections[selectedDocId].overview}
                    </p>
                  </div>

                  {/* Installation */}
                  {docSections[selectedDocId].installation && (
                    <div>
                      <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", marginBottom: "8px", fontFamily: "var(--font-mono)" }}>
                        Installation
                      </h4>
                      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
                        {docSections[selectedDocId].installation?.description}
                      </p>
                      <div style={{
                        position: "relative",
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "6px",
                        padding: "14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        color: "#0f9f78"
                      }}>
                        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10 }}>
                          <CopyButton text={docSections[selectedDocId].installation?.command || ""} />
                        </div>
                        <pre style={{ margin: 0 }}>$ {docSections[selectedDocId].installation?.command}</pre>
                      </div>
                    </div>
                  )}

                  {/* Quickstart Code Block */}
                  {docSections[selectedDocId].quickStartCode && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)" }}>
                          Quick Start Template
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono)" }}>
                          {docSections[selectedDocId].quickStartCode?.filename}
                        </span>
                      </div>
                      <div style={{
                        position: "relative",
                        background: "rgba(0,0,0,0.65)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "6px",
                        padding: "16px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: "1.5",
                        overflowX: "auto"
                      }}>
                        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10 }}>
                          <CopyButton text={docSections[selectedDocId].quickStartCode?.code || ""} />
                        </div>
                        <pre style={{ margin: 0 }}>{docSections[selectedDocId].quickStartCode?.code}</pre>
                      </div>
                    </div>
                  )}

                  {/* Additional detailed sections */}
                  {docSections[selectedDocId].details.map((section, idx) => (
                    <div key={idx} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                      <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", marginBottom: "10px", fontFamily: "var(--font-mono)" }}>
                        {section.sectionTitle}
                      </h4>
                      {typeof section.content === "string" ? (
                        <p style={{ fontSize: "0.92rem", lineHeight: "1.6", color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>
                          {section.content}
                        </p>
                      ) : (
                        section.content
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
