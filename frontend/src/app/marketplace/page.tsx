"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';
import { X, Lock, Download, Rocket, CheckCircle, BrainCircuit, Search, Layers, Zap, Star, Tag, MessageSquare, History, Loader2 } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';
import FeeSponsorship from '../../components/FeeSponsorship';


import { Client } from "../../contracts/nexus_v7/src";
import { rpc } from "../../contracts/nexus_v7/src";

import Link from 'next/link';


const CONTRACT_ID = "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ";


const CREATOR_WALLET = "GBKPWDVU4MJQ4JPMMYWOFTKAGQCSGOWC4MRHMS4VXUJSJJ6HYZBG2OPH";


const APPLETS: any[] = [];


// --- HELPER: CONVERT BYTES TO HEX ---
const toHex = (buffer: Uint8Array | number[]) => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// --- COMPONENT: APPLET DETAILS MODAL ---
function AppletModal({ applet, onClose, walletAddress, isGasless, executeWithSponsorship }: { 
  applet: any, 
  onClose: () => void, 
  walletAddress: string | null,
  isGasless: boolean,
  executeWithSponsorship: (assembled: any) => Promise<any>
}) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [buying, setBuying] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);


  React.useEffect(() => {
    if (walletAddress && applet.id) {
      checkPurchaseStatus();
    }
  }, [walletAddress, applet.id]);

  const checkPurchaseStatus = async () => {
    try {
      const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
      const dummyKey = StellarSdk.Keypair.random();
      const source = new StellarSdk.Account(dummyKey.publicKey(), "0");
      
      const tx = new StellarSdk.TransactionBuilder(source, { fee: StellarSdk.BASE_FEE, networkPassphrase: StellarSdk.Networks.TESTNET })
        .addOperation(StellarSdk.Operation.invokeHostFunction({
          func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
            new StellarSdk.xdr.InvokeContractArgs({
              contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
              functionName: "has_purchased",
              args: [
                new StellarSdk.Address(walletAddress!).toScVal(),
                StellarSdk.nativeToScVal(applet.id, { type: 'u64' })
              ]
            })
          ), auth: []
        })).setTimeout(30).build();

      const sim = await server.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
        // @ts-ignore
        const res = sim.result.retval;
        const bought = StellarSdk.scValToNative(res);
        if (bought) setIsPurchased(true);
      }
    } catch (e) {
      console.warn("Status check failed", e);
    }
  };




  // Parse price safely
  const listingPrice = applet.price ? applet.price.toString() : "0";
  const ratingDisplay = applet.rating_count > 0 ? (applet.rating_sum / applet.rating_count).toFixed(1) : "0.0";


  const handleDownload = () => {
    // In a real app, this would fetch the WASM or Source based on the code_uri
    const blob = new Blob([applet.code_uri || "// Code placeholder"], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${applet.name.replace(/\s+/g, '_').toLowerCase()}_source.rs`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleBuyCode = async () => {
    if (!walletAddress) {
      alert("Please connect wallet first");
      return;
    }
    setBuying(true);

    try {
      const client = new Client({
        networkPassphrase: StellarSdk.Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: walletAddress,
      });

      console.log(`Processing on-chain purchase for applet #${applet.id}...`);

      const assembled = await client.buy_applet({
        buyer: walletAddress,
        listing_id: BigInt(applet.id),
        token_address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
      });

      if (isGasless) {
        await executeWithSponsorship(assembled);
      } else {
        await assembled.signAndSend();
      }

      setIsPurchased(true);
      alert(`Success! Applet #${applet.id} purchased on-chain with fee deduction.`);

    } catch (e: any) {
      console.error("Payment Error:", e);
      alert("Transaction failed: " + e.message);
    }
    setBuying(false);
  };

  const handleLeaveReview = async () => {
    if (!walletAddress) return;
    setReviewing(true);
    try {
      const client = new Client({
        networkPassphrase: StellarSdk.Networks.TESTNET,
        contractId: CONTRACT_ID,
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: walletAddress,
      });

      const assembled = await client.leave_review({
        user: walletAddress,
        listing_id: BigInt(applet.id),
        rating: userRating,
        comment: comment || "Excellent logic!"

      });

      if (isGasless) {
        await executeWithSponsorship(assembled);
      } else {
        await assembled.signAndSend();
      }

      setHasReviewed(true);
      alert("Review submitted successfully!");
    } catch (e: any) {
      console.error("Review Error:", e);
      alert("Failed to submit review: " + e.message);
    }
    setReviewing(false);
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
      <div className="bg-[#09090b]/90 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{applet.name}</h2>
              <span className="px-2 py-0.5 text-[10px] rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 uppercase tracking-widest font-bold">Active</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {applet.category || "General"}</span>
              <span className="flex items-center gap-1"><History className="w-3 h-3" /> v{applet.version || 1}</span>
              <span className="flex items-center gap-1 text-yellow-500/80"><Star className="w-3 h-3 fill-current" /> {ratingDisplay} ({applet.rating_count || 0} reviews)</span>

            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-2 bg-white/5 rounded-lg"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-6 pb-6 pt-4">
          <div className="mb-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Encrypted Logic Hash / Preview</p>
            <p className="text-zinc-300 text-sm p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm leading-relaxed font-mono overflow-auto max-h-40 border-l-2 border-l-blue-500">
              {applet.code_uri || "No source code available for preview."}
            </p>
          </div>

          {(isPurchased || hasReviewed) ? (
            <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20 mb-6">
                <p className="text-xs text-blue-400 font-bold uppercase mb-4">Leave a Review</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setUserRating(i)}>
                      <Star className={`w-6 h-6 ${i <= userRating ? 'text-yellow-500 fill-current' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  placeholder="Share your experience with this logic..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition mb-4 resize-none h-20"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button 
                  onClick={handleLeaveReview}
                  disabled={reviewing || hasReviewed}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold transition disabled:opacity-50"
                >
                  {reviewing ? "Submitting..." : hasReviewed ? "Reviewed" : "Submit Review"}
                </button>
            </div>
          ) : (
            <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Add a review after purchase</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-zinc-700" />)}
              </div>
            </div>
          )}


          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div><p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Price</p><p className="text-3xl font-bold text-white tracking-tight">{listingPrice} <span className="text-sm font-normal text-zinc-500">XLM</span></p></div>
            <div className="flex gap-3">
              {!isPurchased ? (
                <button onClick={handleBuyCode} disabled={buying} className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5" /> Buy License</>}
                </button>
              ) : (
                <button onClick={handleDownload} className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:scale-105">
                  <Download className="w-5 h-5" /> Download .rs
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedApplet, setSelectedApplet] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // States for interactive demos
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [hashLoading, setHashLoading] = useState(false);

  const [artInput, setArtInput] = useState("");
  const [artResult, setArtResult] = useState<string[]>([]);
  const [artLoading, setArtLoading] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Advanced Feature: Fee Sponsorship State
  const [isGasless, setIsGasless] = useState(true);

  React.useEffect(() => {
    isAllowed().then((res) => {
      if (res.isAllowed) requestAccess().then((acc: { address: string }) => setWalletAddress(acc?.address || null));
    });
    fetchLiveListings();
  }, []);

  const connectWallet = async () => {
    const res = await isAllowed();
    if (!res.isAllowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  const fetchLiveListings = async () => {
    setLoadingListings(true);
    try {
      const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
      const dummyKey = StellarSdk.Keypair.random();
      const source = new StellarSdk.Account(dummyKey.publicKey(), "0");

      // 1. Get Count
      const countTx = new StellarSdk.TransactionBuilder(source, { fee: StellarSdk.BASE_FEE, networkPassphrase: StellarSdk.Networks.TESTNET })
        .addOperation(StellarSdk.Operation.invokeHostFunction({
          func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
            new StellarSdk.xdr.InvokeContractArgs({
              contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
              functionName: "get_listing_count",
              args: []
            })
          ), auth: []
        })).setTimeout(30).build();

      const sim = await server.simulateTransaction(countTx);
      let total = 0;
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
        // @ts-ignore
        const res = sim.result.retval;
        total = Number(StellarSdk.scValToNative(res));
      }

      console.log("Marketplace Total:", total);

      // 2. Fetch Items
      const items = [];
      const maxFetch = 50;
      const start = total;
      const end = Math.max(1, total - maxFetch);

      for (let i = start; i >= end; i--) {
        try {
          const itemTx = new StellarSdk.TransactionBuilder(source, { fee: StellarSdk.BASE_FEE, networkPassphrase: StellarSdk.Networks.TESTNET })
            .addOperation(StellarSdk.Operation.invokeHostFunction({
              func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                new StellarSdk.xdr.InvokeContractArgs({
                  contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                  functionName: "get_listing",
                  args: [StellarSdk.nativeToScVal(i, { type: 'u64' })]
                })
              ), auth: []
            })).setTimeout(30).build();

          const itemSim = await server.simulateTransaction(itemTx);
          if (StellarSdk.rpc.Api.isSimulationSuccess(itemSim)) {
            // @ts-ignore
            const rawItem = StellarSdk.scValToNative(itemSim.result.retval);
            
            if (rawItem.name === "Text Processor") {
                rawItem.description = "[Functions: get_stats, execute] Process and analyze text data on-chain. Returns verified stats.";
                rawItem.color = "blue";
            } else if (rawItem.name === "Hash Generator") {
                rawItem.description = "[Functions: generate_hash] Cryptographic SHA-256 hash generation for any input data.";
                rawItem.color = "purple";
            } else if (rawItem.name === "ASCII Art Gen") {
                rawItem.description = "[Functions: generate_art] Generates retro ASCII art frames for your text on-chain.";
                rawItem.color = "green";
            }
            
            rawItem.contractId = rawItem.code_uri;
            items.push(rawItem);
          }
        } catch (ignored) { }
      }
      setListings(items);

    } catch (e) {
      console.error("Listing Fetch Error", e);
    }
    setLoadingListings(false);
  };

  // Advanced Feature: Fee Sponsorship Logic
  const executeWithSponsorship = async (assembled: any) => {
    try {
      // 1. Get the built transaction
      const tx = assembled.built;
      if (!tx) throw new Error("Transaction not built. Ensure you are connected.");

      // 2. User signs the inner transaction via Freighter
      console.log("Requesting user signature for gasless transaction...");
      const signedResult = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });

      // Freighter v6+ returns { signedTxXdr, signerAddress } instead of a plain string
      const signedInnerXdr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
      console.log("Freighter signed XDR type:", typeof signedInnerXdr, "length:", signedInnerXdr?.length);

      // 3. Send to server — it will fee-bump, sign, submit, and poll
      console.log("Sending to sponsorship API for fee bump + submission...");
      const sponsorRes = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionXdr: signedInnerXdr }),
      });

      const sponsorData = await sponsorRes.json();
      if (!sponsorRes.ok) {
        throw new Error(sponsorData.error || "Sponsorship failed");
      }

      console.log("Sponsored transaction result:", sponsorData);

      if (sponsorData.status === "SUCCESS") {
        console.log("Gasless Transaction Successful! Hash:", sponsorData.hash);
        return sponsorData;
      } else {
        throw new Error(`Transaction ended with status: ${sponsorData.status}`);
      }
    } catch (e: any) {
      console.error("Sponsorship Error:", e);
      throw e;
    }
  };


  // Demo Logic
  const runStatsApplet = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: "CD3H3JTC2L44K4IQNB7UG54D6O3LJMUQ6B52XOHE4F7CLSMTC7NQQ637",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: walletAddress || undefined,
      });

      const assembled = await client.get_stats({ text: inputText });

      if (isGasless) {
        await executeWithSponsorship(assembled);
        const sim = await assembled.simulate();
        setResult(`Success! Length: ${sim.result}`);
      } else {
        const tx = await assembled.signAndSend();
        setResult(`Success! Length: ${tx.result}`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Execution failed: " + e.message);
    }
    setLoading(false);
  };

  const runHashApplet = async () => {
    if (!hashInput) return;
    setHashLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: "CBZ5OCL3ZNC7UZ43M4QX5WENPEGHZSG6D3MG75G3DBZUQSQTWP3EBCNE",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: walletAddress || undefined,
      });

      const assembled = await client.generate_hash({ text: hashInput });

      if (isGasless) {
        await executeWithSponsorship(assembled);
        const sim = await assembled.simulate();
        if (sim.result) {
          setHashResult("0x" + toHex(sim.result as any));
        }
      } else {
        const tx = await assembled.signAndSend();
        if (tx && (tx as any).result) {
          setHashResult("0x" + toHex((tx as any).result));
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Hash failed: " + e.message);
    }
    setHashLoading(false);
  };

  const runArtApplet = async () => {
    if (!artInput) return;
    setArtLoading(true);
    try {
      const client = new Client({
        networkPassphrase: Networks.TESTNET,
        contractId: "CBLZWGPNJIRUCKUOZ4OJNNYGYG2JTLDXALFWFBTBLGSZPPEAPETBEVKD",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: walletAddress || undefined,
      });

      const assembled = await client.generate_art({ text: artInput });

      if (isGasless) {
        await executeWithSponsorship(assembled);
        const sim = await assembled.simulate();
        if (sim.result) {
          setArtResult(String(sim.result).split('\n'));
        }
      } else {
        const tx = await assembled.signAndSend();
        if (tx && (tx as any).result) {
          setArtResult(String((tx as any).result).split('\n'));
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Art generation failed: " + e.message);
    }
    setArtLoading(false);
  };

  const runAiApplet = async () => {
    if (!aiInput) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:7860';
      const response = await fetch(`${apiUrl}/api/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiInput }),
      });
      if (!response.ok) throw new Error('AI server response error');
      const data = await response.json();
      setAiResult(data.code);
    } catch (e) {
      console.error(e);
      alert("AI code generation failed.");
    }
    setAiLoading(false);
  };

  const scrollToDemo = (id: number) => {
    document.getElementById(`demo-${id}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MarketplaceScene />

      {/* Navbar */}
      <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-black/20">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Stellar Nexus Logo" className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
          </Link>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-gray-400 font-medium">
          <Link href="/" className="hover:text-white transition hover:scale-105 duration-200">Home</Link>
          <span className="text-white font-medium">Marketplace</span>
          <Link href="/pipeline" className="hover:text-white transition hover:scale-105 duration-200">Pipeline</Link>
          <Link href="/dashboard" className="hover:text-white transition hover:scale-105 duration-200">Dashboard</Link>
          <Link href="/stats" className="hover:text-white transition hover:scale-105 duration-200">Stats</Link>
          <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
          <Link href="/go-live" className="text-cyan-400 font-medium hover:text-cyan-300 transition hover:scale-105 duration-200">Go Live</Link>
        </div>
        <button onClick={connectWallet} className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md">
          {walletAddress ? `Connected: ${walletAddress.slice(0, 4)}...` : "Connect Wallet"}
        </button>
      </nav>

      {/* Hero */}
      <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
          Applet Marketplace
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover, buy, and monetize verified serverless logic. Powered by Soroban Smart Contracts.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-[#09090b]/80 border border-white/10 rounded-full flex items-center p-2 pl-6 backdrop-blur-md">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input type="text" placeholder="Search for applets, AI models, or utilities..." className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500" />
            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Search</button>
          </div>
        </div>
      </div>

      {/* MARKETPLACE LIST */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-500" />
          Live Applets
          {loadingListings && <span className="text-xs text-zinc-500 animate-pulse">(Updating...)</span>}
        </h2>

        {listings.length === 0 && !loadingListings && (
          <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl bg-white/5 mb-12">
            <p className="text-zinc-500 mb-4">No applets listed yet.</p>
            <Link href="/go-live" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition">Be the first to list</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {[...APPLETS, ...listings].map((applet, index) => {
            const isHardcoded = typeof applet.id === 'number';
            const color = applet.color || "blue";
            const status = applet.status || "Active";
            const ownerDisplay = applet.owner ? applet.owner.toString() : "Unknown";
            const shortOwner = ownerDisplay.length > 10 ? ownerDisplay.slice(0, 4) + "..." + ownerDisplay.slice(-4) : ownerDisplay;
            const contractIdDisplay = applet.contractId ? (applet.contractId === "N/A (Off-Chain)" ? "OFF-CHAIN" : applet.contractId.slice(0, 8) + "...") : CONTRACT_ID.slice(0, 8) + "...";
            const priceDisplay = applet.price ? applet.price.toString() : "0";
            const uniqueKey = isHardcoded ? `static-${applet.id}` : `chain-${applet.id?.toString() || index}`;

            return (
              <div key={uniqueKey} className="group bg-[#09090b]/40 border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500 hover:bg-[#0c0c0e]/60 backdrop-blur-md overflow-hidden relative shadow-lg shadow-black/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                      <CheckCircle className={`w-5 h-5 text-${color}-400`} />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition truncate">{applet.name}</h3>
                      <p className="text-xs font-mono text-zinc-500">by {shortOwner}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border border-${color}-500/20 bg-${color}-500/5 text-${color}-300`}>{status}</span>
                </div>

                <p className="text-xs font-mono text-zinc-500 mb-4 ml-1">ID: #{uniqueKey} • {contractIdDisplay}</p>

                {applet.description ? (
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed h-10 line-clamp-2">{applet.description}</p>
                ) : (
                  <div className="mb-8 h-10 overflow-hidden relative">
                    <pre className="text-xs text-zinc-600 font-mono opacity-50">{applet.code_uri || "No preview"}</pre>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent"></div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/5 pt-6 relative z-10">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Price</p>
                    <p className="text-xl font-bold text-white tracking-tight">{priceDisplay} XLM</p>
                  </div>
                  <div className="flex gap-3">
                    {isHardcoded && (
                      <button onClick={() => scrollToDemo(applet.id)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition flex items-center gap-2 text-zinc-300">
                        <Rocket className="w-3.5 h-3.5" /> Demo
                      </button>
                    )}
                    <button onClick={() => setSelectedApplet(applet)} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition hover:scale-105">
                      {isHardcoded ? "Buy License" : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE DEMOS HEADER */}
        {/* ... (Existing Demos Below) ... */}
        {/* Keeping Demos to show utility */}

        <div className="bg-[#09090b]/60 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
              <Rocket className="w-6 h-6 text-purple-500" />
              Live Execution Environment
            </h3>
            <div className="w-full md:w-72 relative z-10">
              <FeeSponsorship enabled={isGasless} onToggle={setIsGasless} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

            {/* Demo 1 */}
            <div id="demo-1" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">Text Processor</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter text to analyze..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" value={inputText} onChange={(e) => setInputText(e.target.value)} />
                <button onClick={runStatsApplet} disabled={loading} className="w-full bg-blue-600/90 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-blue-900/20">
                  {loading ? "Processing On-Chain..." : "Execute Contract"}
                </button>
                {result && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center font-mono text-sm text-blue-200 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-4 h-4 inline mr-2 text-blue-400" /> {result}
                  </div>
                )}
              </div>
            </div>

            {/* Demo 2 */}
            <div id="demo-2" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">Hash Generator</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter data to hash..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition" value={hashInput} onChange={(e) => setHashInput(e.target.value)} />
                <button onClick={runHashApplet} disabled={hashLoading} className="w-full bg-purple-600/90 hover:bg-purple-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-purple-900/20">
                  {hashLoading ? "Computing Hash..." : "Generate SHA-256"}
                </button>
                {hashResult && <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center font-mono text-xs break-all text-purple-200 animate-in fade-in slide-in-from-top-2">{hashResult}</div>}
              </div>
            </div>

            {/* Demo 3 */}
            <div id="demo-3" className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition duration-300">
              <h3 className="text-lg font-bold mb-4 text-zinc-100">ASCII Art Gen</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Enter text..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition" value={artInput} onChange={(e) => setArtInput(e.target.value)} />
                <button onClick={runArtApplet} disabled={artLoading} className="w-full bg-green-600/90 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition shadow-lg shadow-green-900/20">
                  {artLoading ? "Generating Art..." : "Create Artwork"}
                </button>
                {artResult.length > 0 && <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl font-mono text-[10px] leading-tight text-center text-green-300 animate-in fade-in slide-in-from-top-2 overflow-hidden">{artResult.map((line, i) => <div key={i}>{line}</div>)}</div>}
              </div>
            </div>

          </div>

          {/* Demo 4: AI */}
          <div id="demo-4" className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-yellow-500/20 transition duration-300">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-100"><BrainCircuit className="w-5 h-5 text-yellow-400" /> Soroban AI Assistant</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Describe the smart contract function you need (e.g., 'a function that adds two u64 numbers')..." className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none transition" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
              <button onClick={runAiApplet} disabled={aiLoading} className="w-full bg-yellow-600/90 hover:bg-yellow-600 text-white py-3 rounded-xl font-medium transition shadow-lg shadow-yellow-900/20">
                {aiLoading ? "Generating Rust Code..." : "Generate Smart Contract Code"}
              </button>
            </div>
            {aiResult && <div className="mt-4 p-5 bg-[#121215] border border-yellow-500/30 rounded-xl animate-in fade-in slide-in-from-top-4"><pre><code className="font-mono text-xs text-yellow-300 whitespace-pre-wrap">{aiResult}</code></pre></div>}
          </div>

        </div>
      </div>

      {selectedApplet && (
        <AppletModal 
          applet={selectedApplet} 
          onClose={() => setSelectedApplet(null)} 
          walletAddress={walletAddress} 
          isGasless={isGasless}
          executeWithSponsorship={executeWithSponsorship}
        />
      )}

    </main>
  );
}

