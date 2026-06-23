"use client";
import React, { useState } from 'react';
import { isAllowed, setAllowed, requestAccess } from '@stellar/freighter-api';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Cpu, Globe, Code, Layers } from 'lucide-react';
import Crystal from '../components/Crystal';

export default function LandingPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    const res = await isAllowed();
    if (!res.isAllowed) await setAllowed();
    const access = await requestAccess();
    if (access?.address) setWalletAddress(access.address);
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 px-8 py-4 flex justify-between items-center backdrop-blur-sm bg-black/50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Stellar Nexus Logo" className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
          </Link>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-gray-400 font-medium">
          <Link href="/" className="hover:text-white transition hover:scale-105 duration-200">Home</Link>
          <Link href="/marketplace" className="hover:text-white transition hover:scale-105 duration-200">Marketplace</Link>
          <Link href="/pipeline" className="hover:text-white transition hover:scale-105 duration-200">Pipeline</Link>
          <Link href="/dashboard" className="hover:text-white transition hover:scale-105 duration-200">Dashboard</Link>
          <Link href="/stats" className="hover:text-white transition hover:scale-105 duration-200">Stats</Link>
          <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
          <Link href="/go-live" className="text-cyan-400 font-medium hover:text-cyan-300 transition hover:scale-105 duration-200">Go Live</Link>
        </div>
        <button onClick={connectWallet} className="bg-white/5 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/10 transition backdrop-blur-md">
          {walletAddress ? `Connected: ${walletAddress.slice(0, 4)}...` : "Connect Wallet"}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left: Crystal Scene */}
        <div className="flex-1 relative h-[500px] w-full">
          <Crystal />
        </div>

        {/* Right: Text Content */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Stellar Soroban Mainnet Ready
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700 leading-tight">
            Compute, <br />
            <span className="italic font-serif text-cyan-100">Decentralized.</span>
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            The marketplace for verified serverless logic. Execute AI, hash generation, and data processing on the Stellar Soroban network.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
            <Link href="/marketplace" className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
              Explore Models <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pipeline" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition duration-200 backdrop-blur-sm flex items-center justify-center">
              Build Pipeline
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid - UPGRADED */}
      <section className="relative z-10 py-32 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="group p-8 rounded-2xl bg-[#09090b] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:bg-[#0c0c0e] overflow-hidden relative shadow-lg shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 bg-[#121215] rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:text-cyan-300 group-hover:scale-110 transition duration-300 relative z-10 border border-white/5 shadow-inner shadow-white/5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white relative z-10 group-hover:text-cyan-100 transition-colors">Soroban-Powered</h3>
              <p className="text-zinc-400 leading-relaxed text-sm relative z-10 font-medium">
                Applets run as verified Smart Contracts on Stellar, ensuring deterministic and trustless execution.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-[#09090b] border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:bg-[#0c0c0e] overflow-hidden relative shadow-lg shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 bg-[#121215] rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition duration-300 relative z-10 border border-white/5 shadow-inner shadow-white/5">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white relative z-10 group-hover:text-purple-100 transition-colors">Logic Marketplace</h3>
              <p className="text-zinc-400 leading-relaxed text-sm relative z-10 font-medium">
                Buy and sell verified code snippets. From text processors to AI models, monetize your logic.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-[#09090b] border border-white/5 hover:border-green-500/30 transition-all duration-500 hover:bg-[#0c0c0e] overflow-hidden relative shadow-lg shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 bg-[#121215] rounded-xl flex items-center justify-center mb-6 text-green-400 group-hover:text-green-300 group-hover:scale-110 transition duration-300 relative z-10 border border-white/5 shadow-inner shadow-white/5">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white relative z-10 group-hover:text-green-100 transition-colors">AI Integration</h3>
              <p className="text-zinc-400 leading-relaxed text-sm relative z-10 font-medium">
                Seamlessly chain on-chain logic with off-chain AI computation for hybrid decentralized applications.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Code Demo Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            Developer Experience, <br />
            <span className="text-blue-500">Reimagined.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Forget complex tooling. Stellar Nexus provides a unified pipeline to build, test, and deploy decentralized applets in minutes.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-blue-500" /> Rust-based Smart Contracts
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-blue-500" /> Instant Testnet Deployment
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-blue-500" /> Integrated AI Assistance
            </li>
          </ul>
        </div>

        <div className="flex-1 w-full relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden group">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <span className="text-xs text-gray-500 font-mono ml-2">contract.rs</span>
            </div>
            <pre className="font-mono text-sm text-gray-300 overflow-x-auto">
              <code>
                <span className="text-purple-400">pub fn</span> <span className="text-blue-400">process_data</span>(env: Env, data: String) {'{'}
                {'\n'}  <span className="text-gray-500">// Verify input</span>
                {'\n'}  <span className="text-purple-400">let</span> hash = env.crypto().sha256(&data);
                {'\n'}
                {'\n'}  <span className="text-gray-500">// Log execution</span>
                {'\n'}  log!(&env, <span className="text-green-400">"Data Processed: { }"</span>, hash);
                {'\n'}
                {'\n'}  <span className="text-gray-500">// Return result</span>
                {'\n'}  hash
                {'\n'}{'}'}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded items-center justify-center flex text-xs font-bold">S</div>
            <span className="text-gray-400 font-medium">Stellar Nexus</span>
          </div>
          <div className="text-gray-600 text-sm">
            © 2026 Stellar Nexus Protocol. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition"><Globe className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition"><Code className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}