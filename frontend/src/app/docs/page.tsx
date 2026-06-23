"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Book, Layers, ShoppingBag, Code, ArrowRight, Shield, Globe, Cpu, Hash, FileCode, Box } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';

// --- CONTENT SECTIONS ---

const IntroSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h2 className="text-3xl font-bold mb-4">Stellar Nexus Protocol</h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
                Stellar Nexus is a decentralized computing marketplace and pipeline orchestrator built on the <strong className="text-white">Stellar Soroban</strong> network. It enables the seamless exchange, verification, and execution of serverless logic (Applets) in a trustless environment.
            </p>
        </div>

        <div className="bg-[#0A0A0C] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> System Architecture</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-800 p-3 rounded-lg text-sm font-mono border border-white/5">Frontend (Next.js)</div>
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                    <div className="bg-zinc-800 p-3 rounded-lg text-sm font-mono border border-white/5">Freighter Wallet</div>
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                    <div className="bg-blue-900/40 p-3 rounded-lg text-sm font-mono border border-blue-500/30 text-blue-200">Soroban Contracts</div>
                </div>
                <p className="text-sm text-zinc-500 italic mt-2">
                    User interactions are signed by Freighter and submitted directly to the Soroban blockchain, ensuring no central server controls execution.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold mb-2 text-purple-300">Logic Marketplace</h4>
                <p className="text-sm text-zinc-400">Registry for verified WASM binaries. Creators monetize code; users verify integrity before execution.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold mb-2 text-green-300">Pipeline Orchestrator</h4>
                <p className="text-sm text-zinc-400">Stateful execution engine chaining multiple applets. Output of Step A becomes verified Input of Step B.</p>
            </div>
        </div>
    </div>
);

const MarketplaceSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="border-b border-white/10 pb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><ShoppingBag className="w-8 h-8 text-purple-500" /> Logic Marketplace</h2>
            <p className="text-zinc-400">The registry layer ensuring code immutability and provenance.</p>
        </div>

        <div className="space-y-6">
            <h3 className="text-xl font-bold">The Purchasing Flow</h3>
            <div className="bg-[#09090b]/80 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-800"></div>
                <div className="space-y-8 relative">
                    <div className="flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-white">1. Select Applet</h4>
                            <p className="text-sm text-zinc-400">User browses the registry for logic (e.g. "Text Processor") and checks the hash verification.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-purple-500 mt-1 shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-white">2. Buy License</h4>
                            <p className="text-sm text-zinc-400">User executes a <code>payment</code> operation on Stellar. The contract validates the amount and recipient (Creator).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-green-500 mt-1 shrink-0"></div>
                        <div>
                            <h4 className="font-bold text-white">3. Unlock & Execute</h4>
                            <p className="text-sm text-zinc-400">Upon payment success, the protocol emits an event unlocking the WASM download or enabling execution rights for the Pipeline.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-4">Verification Policy</h3>
            <ul className="grid grid-cols-1 gap-4">
                <li className="bg-white/5 p-4 rounded-lg border border-white/5 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-zinc-300"><strong>Source Match:</strong> WASM hash must match the compiled source from the linked GitHub repo.</span>
                </li>
                <li className="bg-white/5 p-4 rounded-lg border border-white/5 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-zinc-300"><strong>Reproducible Builds:</strong> Builds run in isolated Docker containers to guarantee determinism.</span>
                </li>
            </ul>
        </div>
    </div>
);

const PipelineSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="border-b border-white/10 pb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Layers className="w-8 h-8 text-blue-500" /> Pipeline Builder</h2>
            <p className="text-zinc-400">Chain discrete applets into complex, atomic workflows.</p>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-4">Pipeline Specification (JSON)</h3>
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                <pre>{`{
  "pipeline_id": "pip_123456",
  "name": "Data Verification Flow",
  "stages": [
    {
      "id": 1,
      "type": "execution",
      "contract_id": "CC7T...",
      "function": "clean_text",
      "inputs": ["\${USER_INPUT}"]
    },
    {
      "id": 2,
      "type": "processing",
      "contract_id": "CB2A...",
      "function": "generate_hash",
      "inputs": ["\${STAGE_1_OUTPUT}"] 
    }
  ]
}`}</pre>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Pipelines are defined as DAGs where <code>inputs</code> can reference previous stage outputs.</p>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-4">Atomic Execution Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="text-blue-400 font-bold mb-2">1. Init</div>
                    <p className="text-xs text-zinc-400">Frontend parses JSON spec and validates user balance and contract existence.</p>
                </div>
                <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="text-purple-400 font-bold mb-2">2. Chain</div>
                    <p className="text-xs text-zinc-400">Step 1 output is signed and passed to Step 2. If Step 1 fails, the pipeline halts.</p>
                </div>
                <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="text-green-400 font-bold mb-2">3. Finalize</div>
                    <p className="text-xs text-zinc-400">Final state is committed to the mainnet ledger as a proof of execution.</p>
                </div>
            </div>
        </div>
    </div>
);

const ContractsSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="border-b border-white/10 pb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Code className="w-8 h-8 text-yellow-500" /> Smart Contracts</h2>
            <p className="text-zinc-400">Developing compatible applets for the Nexus ecosystem.</p>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-4">Standard Interface (Rust)</h3>
            <p className="text-zinc-400 text-sm mb-4">To be listed, your Soroban contract should implement the standard Nexus interface:</p>

            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                <pre><code className="text-zinc-300"><span className="text-red-400">#[contractimpl]</span>
                    <span className="text-purple-400">impl</span> MyApplet {'{'}

                    <span className="text-gray-500">/// Returns metadata for the registry</span>
                    <span className="text-purple-400">pub fn</span> <span className="text-blue-400">get_metadata</span>(env: Env) -&gt; Symbol {'{'}
                    symbol_short!(<span className="text-green-400">"NexusV1"</span>)
                    {'}'}

                    <span className="text-gray-500">/// Main execution entry point</span>
                    <span className="text-purple-400">pub fn</span> <span className="text-blue-400">execute</span>(env: Env, input: String) -&gt; String {'{'}
                    <span className="text-purple-400">let</span> processed = self.do_work(input);
                    processed
                    {'}'}
                    {'}'}</code></pre>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-bold">Deployment Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-zinc-400 text-sm">
                <li>Initialize project: <code className="bg-white/10 px-1 rounded text-white">soroban contract init my-applet</code></li>
                <li>Build WASM: <code className="bg-white/10 px-1 rounded text-white">soroban contract build --release</code></li>
                <li>Deploy: <code className="bg-white/10 px-1 rounded text-white">soroban contract deploy ...</code></li>
                <li>Submit the resulting <strong>Contract ID</strong> to the Marketplace Registry.</li>
            </ol>
        </div>
    </div>
);

const UISection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="border-b border-white/10 pb-6">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Box className="w-8 h-8 text-cyan-500" /> Crystal UI System</h2>
            <p className="text-zinc-400">Design specifications for the Stellar Nexus interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-bold mb-2">Color Palette</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black border border-white/20 rounded-lg"></div> <span className="text-zinc-400">Background: #050505</span></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-500 rounded-lg"></div> <span className="text-zinc-400">Primary: Blue-500</span></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-purple-500 rounded-lg"></div> <span className="text-zinc-400">Hashing: Purple-500</span></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-cyan-400 rounded-lg"></div> <span className="text-zinc-400">Accents: Cyan-400</span></div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold mb-2">Glassmorphism</h3>
                <p className="text-sm text-zinc-400 mb-4">We use a combination of low-opacity backgrounds and heavy backdrop blur to integrate UI with the 3D scene.</p>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
                    <span className="text-white font-bold">Glass Card Example</span>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold mb-4">3D Crystal Primitive</h3>
            <p className="text-sm text-zinc-400 mb-4">The core visual element is the <code>MeshTransmissionMaterial</code> Icosahedron.</p>
            <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 font-mono text-sm overflow-x-auto text-zinc-300">
                &lt;MeshTransmissionMaterial <br />
                &nbsp;&nbsp;thickness={'{2}'}<br />
                &nbsp;&nbsp;chromaticAberration={'{0.5}'}<br />
                &nbsp;&nbsp;distortion={'{0.5}'}<br />
                &nbsp;&nbsp;iridescence={'{1}'}<br />
                /&gt;
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState<'intro' | 'market' | 'pipeline' | 'contracts' | 'ui'>('intro');

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden relative flex flex-col">

            {/* 3D Background - Reused for consistency */}
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <MarketplaceScene />
            </div>

            {/* Navbar */}
            <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/40">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <img src="/logo.jpg" alt="Stellar Nexus Logo" className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
                    </Link>
                </div>
                <div className="flex gap-6 text-sm text-gray-400">
                    <Link href="/" className="hover:text-white transition hover:scale-105 duration-200">Home</Link>
                    <Link href="/marketplace" className="hover:text-white transition hover:scale-105 duration-200">Marketplace</Link>
                    <Link href="/pipeline" className="hover:text-white transition hover:scale-105 duration-200">Pipeline</Link>
                    <Link href="/dashboard" className="hover:text-white transition hover:scale-105 duration-200">Dashboard</Link>
                    <Link href="/stats" className="hover:text-white transition hover:scale-105 duration-200">Stats</Link>
                    <span className="text-white font-medium cursor-default">Docs</span>
                    <Link href="/go-live" className="text-cyan-400 font-medium hover:text-cyan-300 transition hover:scale-105 duration-200">Go Live</Link>
                </div>
                <button className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md">
                    Connect Wallet
                </button>
            </nav>

            {/* Layout */}
            <div className="flex flex-1 max-w-7xl mx-auto w-full h-[calc(100vh-80px)]">

                {/* Sidebar */}
                <aside className="w-64 border-r border-white/5 py-8 hidden md:block overflow-y-auto">
                    <div className="mb-8 px-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Documentation</h4>
                        <nav className="space-y-1">
                            <button onClick={() => setActiveTab('intro')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'intro' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                Introduction
                            </button>
                            <button onClick={() => setActiveTab('market')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'market' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                Marketplace Guide
                            </button>
                            <button onClick={() => setActiveTab('pipeline')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'pipeline' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                Pipeline Builder
                            </button>
                        </nav>
                    </div>
                    <div className="px-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Developers</h4>
                        <nav className="space-y-1">
                            <button onClick={() => setActiveTab('contracts')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'contracts' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                Smart Contracts
                            </button>
                            <button onClick={() => setActiveTab('ui')} className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'ui' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                                Crystal UI System
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
                    <div className="max-w-3xl mx-auto pb-20">
                        {activeTab === 'intro' && <IntroSection />}
                        {activeTab === 'market' && <MarketplaceSection />}
                        {activeTab === 'pipeline' && <PipelineSection />}
                        {activeTab === 'contracts' && <ContractsSection />}
                        {activeTab === 'ui' && <UISection />}
                    </div>
                </div>

            </div>
        </main>
    );
}
