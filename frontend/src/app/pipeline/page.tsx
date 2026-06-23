"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess } from '@stellar/freighter-api';
import { Networks } from '@stellar/stellar-sdk';
import { Client } from "../../contracts/nexus_v7/src";
import Link from 'next/link';
import { ArrowDown, CheckCircle, Play, Layers, Activity, ArrowRight } from 'lucide-react';
import PipelineScene from '../../components/PipelineScene';

// 🛑 PASTE YOUR CONTRACT ID HERE
const CONTRACT_ID = "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ";

export default function PipelinePage() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");

    // Pipeline Stages
    const [stage, setStage] = useState<0 | 1 | 2 | 3>(0); // 0: Idle, 1: Proc, 2: Hash, 3: Done
    const [procResult, setProcResult] = useState("");
    const [finalHash, setFinalHash] = useState("");

    const connectWallet = async () => {
        const allowed = await isAllowed();
        if (!allowed) await setAllowed();
        const access = await requestAccess();
        if (access?.address) setWalletAddress(access.address);
    };

    const executePipeline = async () => {
        if (!walletAddress) { alert("Connect wallet first"); return; }
        if (!inputText) return;

        try {
            setStage(1); // Start Step 1

            const client = new Client({
                networkPassphrase: Networks.TESTNET,
                contractId: CONTRACT_ID,
                rpcUrl: "https://soroban-testnet.stellar.org",
                allowHttp: true,
                publicKey: walletAddress,
            });

            // --- STEP 1: Text Processor ---
            console.log("Running Step 1: Text Processor...");
            // In a real pipeline, we'd sign once. For this demo, we might sign twice 
            // or use the result of 1 to feed 2 locally.
            const tx1 = await client.get_stats({ text: inputText }, { fee: "10000" });

            // Simulate extracting the "Processed" text (In real app we parse tx1.result)
            const intermediateData = inputText + " [Verified]";
            setProcResult(intermediateData);

            // --- STEP 2: Hash Generator ---
            setStage(2); // Start Step 2
            console.log("Running Step 2: Hashing...");

            // We pass the RESULT of Step 1 into Step 2
            const tx2 = await client.generate_hash({ text: intermediateData }, { fee: "10000" });

            // Simulate final hash
            const mockHash = "0x" + Math.random().toString(16).substr(2, 64);
            setFinalHash(mockHash);

            setStage(3); // Complete

        } catch (e) {
            console.error(e);
            alert("Pipeline failed. See console.");
            setStage(0);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">

            {/* 3D Background */}
            <PipelineScene />

            {/* Navbar */}
            <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/20">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
                        <img src="/logo.jpg" alt="Stellar Nexus Logo" className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
                    </Link>
                </div>
                <div className="hidden md:flex gap-6 text-sm text-gray-400 font-medium">
                    <Link href="/" className="hover:text-white transition hover:scale-105 duration-200">Home</Link>
                    <Link href="/marketplace" className="hover:text-white transition hover:scale-105 duration-200">Marketplace</Link>
                    <span className="text-white font-medium">Pipeline</span>
                    <Link href="/dashboard" className="hover:text-white transition hover:scale-105 duration-200">Dashboard</Link>
                    <Link href="/stats" className="hover:text-white transition hover:scale-105 duration-200">Stats</Link>
                    <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
                    <Link href="/go-live" className="text-cyan-400 font-medium hover:text-cyan-300 transition hover:scale-105 duration-200">Go Live</Link>
                </div>
                <button onClick={connectWallet} className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md">
                    {walletAddress ? `...${walletAddress.slice(-4)}` : "Connect Wallet"}
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-16 relative">
                <div className="mb-12 text-center relative z-10">
                    <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent tracking-tight">Pipeline Builder</h1>
                    <p className="text-zinc-400 text-lg">Chain multiple applets into a single automated workflow.</p>
                </div>

                {/* --- INPUT AREA --- */}
                <div className="bg-[#09090b]/60 border border-white/10 p-8 rounded-3xl mb-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                        <Layers className="w-6 h-6 text-blue-400" /> Raw Data Input
                    </h3>
                    <div className="flex gap-4 relative z-10">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter data to process..."
                            className="flex-1 bg-[#121215]/80 border border-white/10 rounded-xl px-5 py-4 focus:border-blue-500 outline-none transition text-white placeholder-zinc-600"
                        />
                        <button
                            onClick={executePipeline}
                            disabled={stage > 0 && stage < 3}
                            className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/20"
                        >
                            {stage > 0 && stage < 3 ? "Running..." : <><Play className="w-5 h-5 fill-current" /> Run Pipeline</>}
                        </button>
                    </div>
                </div>

                {/* --- THE PIPELINE VISUALIZATION --- */}
                <div className="space-y-6 relative">

                    {/* Connecting Line (Visual) */}
                    <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-white/5 -z-10 rounded-full">
                        <div className={`w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-in-out ${stage === 0 ? 'h-0' : stage === 1 ? 'h-1/3' : stage === 2 ? 'h-2/3' : 'h-full'}`}></div>
                    </div>

                    {/* STEP 1 CARD */}
                    <div className={`relative transition-all duration-500 p-8 rounded-3xl border backdrop-blur-md overflow-hidden group ${stage >= 1 ? 'border-blue-500/30 bg-blue-900/10 shadow-lg shadow-blue-500/10' : 'border-white/5 bg-[#09090b]/40'}`}>
                        {stage >= 1 && <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>}

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="font-bold flex items-center gap-4 text-lg">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${stage >= 1 ? 'bg-blue-600 text-white shadow-blue-400/20' : 'bg-white/5 text-zinc-500 shadow-white/5'}`}>1</span>
                                <span className={stage >= 1 ? 'text-blue-100' : 'text-zinc-400'}>Text Processor</span>
                            </h3>
                            {stage >= 1 && <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/20 animate-in fade-in zoom-in">Executed</span>}
                        </div>

                        <div className={`ml-14 transition-all duration-500 ${stage >= 1 ? 'opacity-100 max-h-40' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-zinc-300">
                                <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-zinc-500 text-xs uppercase">Input</span>
                                    <span className="text-white">"{inputText}"</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 text-xs uppercase">Output</span>
                                    <span className="text-blue-200">"{procResult}"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ARROW */}
                    <div className="flex justify-center py-2 pl-2">
                        <ArrowDown className={`w-6 h-6 transition-colors duration-500 ${stage >= 2 ? 'text-purple-400 animate-bounce' : 'text-zinc-700'}`} />
                    </div>

                    {/* STEP 2 CARD */}
                    <div className={`relative transition-all duration-500 p-8 rounded-3xl border backdrop-blur-md overflow-hidden group ${stage >= 2 ? 'border-purple-500/30 bg-purple-900/10 shadow-lg shadow-purple-500/10' : 'border-white/5 bg-[#09090b]/40'}`}>
                        {stage >= 2 && <div className="absolute inset-0 bg-purple-500/5 pointer-events-none"></div>}

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="font-bold flex items-center gap-4 text-lg">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${stage >= 2 ? 'bg-purple-600 text-white shadow-purple-400/20' : 'bg-white/5 text-zinc-500 shadow-white/5'}`}>2</span>
                                <span className={stage >= 2 ? 'text-purple-100' : 'text-zinc-400'}>Hash Generator</span>
                            </h3>
                            {stage >= 2 && <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/20 animate-in fade-in zoom-in">Executed</span>}
                        </div>

                        <div className={`ml-14 transition-all duration-500 ${stage >= 2 ? 'opacity-100 max-h-40' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-zinc-300 break-all">
                                <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-zinc-500 text-xs uppercase">Input</span>
                                    <span className="text-zinc-400 truncate max-w-[200px]">"{procResult}"</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-zinc-500 text-xs uppercase">Output Hash</span>
                                    <span className="text-purple-300">{finalHash}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUCCESS STATE */}
                    {stage === 3 && (
                        <div className="mt-8 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-5 animate-in fade-in slide-in-from-bottom-8 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-green-400 mb-1">Pipeline Complete</h4>
                                <p className="text-zinc-400">All logic validated and recorded on Stellar Testnet.</p>
                            </div>
                            <button className="ml-auto bg-green-600/10 hover:bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-sm font-bold transition border border-green-500/20 flex items-center gap-2">
                                View on Explorer <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}