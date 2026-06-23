"use client";
import React from 'react';
import { Shield, Zap, Info } from 'lucide-react';

interface FeeSponsorshipProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    sponsorAddress?: string;
}

export default function FeeSponsorship({ enabled, onToggle, sponsorAddress = "GBQUOYUK5SBEOUNSC4JWHNFTBAIHNU2RBDC7OYPRE2LCMH4BD3YHI4ZC" }: FeeSponsorshipProps) {
    return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${enabled ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${enabled ? 'bg-cyan-500 text-black' : 'bg-white/10 text-zinc-400'}`}>
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Gasless Mode</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Powered by Stellar Fee Bumps</p>
                    </div>
                </div>
                <button 
                    onClick={() => onToggle(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                >
                    <span
                        className={`${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>

            {enabled ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-start gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
                        <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-400 leading-tight">
                            Nexus Treasury is sponsoring your transaction fees. You don't need XLM in your wallet to execute this contract.
                        </p>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Sponsor</span>
                        <span className="text-[9px] font-mono text-cyan-400/80">{sponsorAddress}</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-1">
                    <Info className="w-3 h-3 text-zinc-600" />
                    <p className="text-[10px] text-zinc-600">Standard transaction fees apply (approx. 0.00001 XLM).</p>
                </div>
            )}
        </div>
    );
}
