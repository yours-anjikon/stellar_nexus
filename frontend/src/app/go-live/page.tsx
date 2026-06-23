"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Play, Zap, Code, CheckCircle, Loader2, FileCode, Wallet, Download } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';
import { isAllowed, setAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

// 🛑 CONFIGURATION
const CONTRACT_ID = "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export default function GoLivePage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Editor State
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("10");

    // Listing State
    const [isListing, setIsListing] = useState(false);
    const [listStatus, setListStatus] = useState<'idle' | 'signing' | 'uploading' | 'confirming' | 'success'>('idle');
    const [txHash, setTxHash] = useState("");

    // Wallet State
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        isAllowed().then(allowed => {
            if (allowed) {
                requestAccess().then(access => {
                    if (access?.address) setWalletAddress(access.address);
                });
            }
        });
    }, []);

    const connectWallet = async () => {
        try {
            const allowed = await setAllowed();
            if (allowed) {
                const access = await requestAccess();
                if (access?.address) setWalletAddress(access.address);
            }
        } catch (e) {
            console.error("Wallet connection failed", e);
        }
    };

    const simulateTyping = (text: string) => {
        let currentText = "";
        setCode("");
        const lines = text.split('\n');
        let lineIndex = 0;
        const interval = setInterval(() => {
            if (lineIndex >= lines.length) {
                clearInterval(interval);
                setIsGenerating(false);
                return;
            }
            currentText += lines[lineIndex] + "\n";
            setCode(currentText);
            lineIndex++;
        }, 30);
    };

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        if (!name) setName("Nexus Applet");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:7860';
            const response = await fetch(`${apiUrl}/api/generate-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) throw new Error('AI server response error');
            const data = await response.json();

            if (data.code) {
                simulateTyping(data.code);
            } else {
                throw new Error("Invalid response from AI server");
            }

        } catch (error) {
            console.error(error);
            alert("AI code generation failed. Ensure your AI Node is running or env vars are set.");
            setIsGenerating(false);
        }
    };

    const handleList = async () => {
        if (!code || !name) return;
        setIsListing(true);
        setListStatus('signing');

        try {
            // 1. Ensure Wallet is Connected
            let ownerAddress = walletAddress;
            if (!ownerAddress) {
                const access = await requestAccess();
                ownerAddress = access?.address ?? null;
            }

            if (!ownerAddress) {
                alert("Please connect your Freighter wallet to continue.");
                setIsListing(false);
                setListStatus('idle');
                return;
            }

            const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
            const source = await server.getAccount(ownerAddress);

            // 2. Build Transaction Explicitly (Low-Level)
            // Use invokeHostFunction to guarantee argument order and types

            const priceBigInt = BigInt(price) || BigInt(10); // Fallback to 10 if parsing fails

            const op = StellarSdk.Operation.invokeHostFunction({
                func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                    new StellarSdk.xdr.InvokeContractArgs({
                        contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                        functionName: "list_applet",
                        args: [
                            new StellarSdk.Address(ownerAddress).toScVal(),             // owner
                            StellarSdk.xdr.ScVal.scvString(name),                       // name
                            StellarSdk.nativeToScVal(priceBigInt, { type: "i128" }),    // price
                            StellarSdk.xdr.ScVal.scvString(code),                       // code
                            StellarSdk.xdr.ScVal.scvSymbol("Utility")                   // category
                        ]
                    })
                ),
                auth: [] // Auth is usually auto-handled by source account
            });

            let tx = new StellarSdk.TransactionBuilder(source, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: NETWORK_PASSPHRASE,
            })
                .addOperation(op)
                .setTimeout(180) // Restore timeout to satisfy TimeBounds
                .build();

            // 3. Prepare Transaction (Network Simulation for Fees)
            // Critical: This populates resource resource fee
            try {
                tx = await server.prepareTransaction(tx);
            } catch (simError: any) {
                console.error("Preparation Failed:", simError);
                throw new Error("Contract Simulation Failed: " + simError.message);
            }

            // 4. Sign with Freighter
            const signedParams = await signTransaction(tx.toXDR(), {
                networkPassphrase: NETWORK_PASSPHRASE
            });

            if (signedParams.error) {
                throw new Error("Signing rejected: " + signedParams.error);
            }

            // 5. Submit to Testnet
            setListStatus('uploading');
            const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedParams.signedTxXdr, NETWORK_PASSPHRASE);
            const result = await server.sendTransaction(signedTx);

            if (result.status !== "PENDING") {
                console.error("On-Chain Failure", result);
                let detail = "Unknown Error";
                // @ts-ignore
                if (result.errorResult) {
                    // @ts-ignore
                    detail = "Protocol Rejection (XDR available in console)";
                }
                const link = result.hash ? `https://stellar.expert/explorer/testnet/tx/${result.hash}` : null;
                const msg = `Transaction Failed. ${detail} ${link ? `\nView: ${link}` : ''}`;
                alert(msg);
                setListStatus('idle');
            } else {
                // 🛑 NEW: Poll for Confirmation
                setListStatus('confirming');
                const txHash = result.hash;
                setTxHash(txHash);

                let isConfirmed = false;
                let attempts = 0;
                while (!isConfirmed && attempts < 20) { // Wait up to 20-30s
                    await new Promise(r => setTimeout(r, 1500));
                    const txInfo = await server.getTransaction(txHash);
                    if (txInfo.status === "SUCCESS") {
                        isConfirmed = true;
                    } else if (txInfo.status === "FAILED") {
                        throw new Error("Transaction Failed On-Chain!");
                    }
                    attempts++;
                }

                if (isConfirmed) {
                    setListStatus('success');
                } else {
                    throw new Error("Transaction Timed Out (Check Explorer)");
                }
            }

        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
            setListStatus('idle');
        }
        setIsListing(false);
    };
    const handleDownload = () => {
        if (!code) return;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name || 'nexus_applet'}.rs`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative flex flex-col">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <MarketplaceScene />
            </div>

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
                    <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
                    <span className="text-cyan-400 font-medium">Go Live</span>
                </div>
                <button
                    onClick={connectWallet}
                    className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    {walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "Connect Wallet"}
                </button>
            </nav>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
                {/* AI / PROMPT SIDE */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-[#09090b]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex-1 flex flex-col shadow-2xl">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-400" /> Nexus AI
                            </h1>
                            <p className="text-zinc-400">Describe the logic you want to sell. Our AI Node will compile the Soroban contract.</p>
                        </div>

                        <div className="relative mt-auto">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="e.g. 'A text processing bot that counts words'..."
                                className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-4 pr-16 text-white placeholder-zinc-600 focus:border-yellow-500/50 outline-none transition"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt}
                                className="absolute right-2 top-2 bottom-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* EDITOR / LISTING SIDE */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-full">
                        <div className="bg-[#252526] px-4 py-2 flex justify-between items-center border-b border-black">
                            <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-mono text-zinc-300">lib.rs (Live Editor)</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Applet Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:border-cyan-500 outline-none"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-zinc-500">Price (XLM)</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-16 bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-[#1e1e1e]">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="// Write your Rust code here or wait for AI..."
                                className="absolute inset-0 w-full h-full bg-transparent text-zinc-300 font-mono text-xs md:text-sm p-4 outline-none resize-none leading-relaxed"
                                spellCheck="false"
                            />
                            {!code && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 pointer-events-none flex-col gap-2">
                                    <Code className="w-12 h-12 opacity-20" />
                                    <span>Workspace Empty</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-[#252526] border-t border-black flex justify-between items-center">
                            <div className="text-xs text-zinc-500 font-mono">
                                {listStatus === 'idle' && "Ready to list on-chain"}
                                {listStatus === 'signing' && "Waiting for signature..."}
                                {listStatus === 'uploading' && "Registering on Testnet..."}
                                {listStatus === 'confirming' && <span className="text-yellow-400">Confirming Transaction...</span>}
                                {listStatus === 'success' && <span className="text-green-400">Successfully Listed! Tx: <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" className="underline">View</a></span>}
                            </div>
                                <button
                                    onClick={handleDownload}
                                    disabled={!code}
                                    className="bg-white/5 hover:bg-white/10 text-zinc-400 p-2 rounded-lg transition disabled:opacity-30 border border-white/5"
                                    title="Download as .rs file"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleList}
                                    disabled={!code || !name || isListing || listStatus === 'success'}
                                    className={`
                                        px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition
                                        ${listStatus === 'success' ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {isListing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : listStatus === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-current" />
                                    )}
                                    {listStatus === 'success' ? "On Sale" : isListing ? "Sign & List" : "Sell Logic"}
                                </button>
                            </div>
                        </div>
                </div>
            </div>
        </main>
    );
}
