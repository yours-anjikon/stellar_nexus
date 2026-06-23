"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Package, Layers, Loader2, RefreshCw } from 'lucide-react';
import MarketplaceScene from '../../components/MarketplaceScene';
import { isAllowed, setAllowed, requestAccess } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ"; // Updated ID
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export default function DashboardPage() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        isAllowed().then(res => {
            if (res.isAllowed) {
                requestAccess().then(access => {
                    if (access?.address) {
                        setWalletAddress(access.address);
                        fetchListings(access.address);
                    }
                });
            }
        });
    }, []);

    const connectWallet = async () => {
        const res = await setAllowed();
        if (res.isAllowed) {
            const access = await requestAccess();
            if (access?.address) {
                setWalletAddress(access.address);
                fetchListings(access.address);
            }
        }
    };

    const fetchListings = async (address: string) => {
        setIsLoading(true);
        try {
            const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

            // 1. Get Total Count via SimulateTransaction
            // Using a dummy account for simulation is cleaner than using the user's account with sequence 0
            const dummyKey = StellarSdk.Keypair.random();
            const source = new StellarSdk.Account(dummyKey.publicKey(), "0");

            const countTx = new StellarSdk.TransactionBuilder(
                source,
                { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
            )
                .addOperation(StellarSdk.Operation.invokeHostFunction({
                    func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                        new StellarSdk.xdr.InvokeContractArgs({
                            contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                            functionName: "get_listing_count",
                            args: []
                        })
                    ),
                    auth: []
                }))
                .setTimeout(30)
                .build();

            const sim = await server.simulateTransaction(countTx);

            let totalCount = 0;
            if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
                // @ts-ignore
                const result = sim.result.retval;
                totalCount = Number(StellarSdk.scValToNative(result));
            }

            console.log("Total Listings on Contract:", totalCount);

            // 2. Fetch All Listings
            const fetchedListings = [];
            const maxFetch = 20;
            const startId = totalCount;
            const endId = Math.max(1, totalCount - maxFetch);

            for (let i = startId; i >= endId; i--) {
                try {
                    const tx = new StellarSdk.TransactionBuilder(
                        source,
                        { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE }
                    )
                        .addOperation(StellarSdk.Operation.invokeHostFunction({
                            func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                                new StellarSdk.xdr.InvokeContractArgs({
                                    contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                                    functionName: "get_listing",
                                    args: [StellarSdk.nativeToScVal(i, { type: 'u64' })]
                                })
                            ),
                            auth: []
                        }))
                        .setTimeout(30)
                        .build();

                    const itemSim = await server.simulateTransaction(tx);

                    // @ts-ignore
                    if (StellarSdk.rpc.Api.isSimulationSuccess(itemSim)) {
                        // @ts-ignore
                        const listing = StellarSdk.scValToNative(itemSim.result.retval);

                        console.log(`Fetched listing ${i}:`, listing);

                        const listingOwner = listing.owner.toString();
                        const currentUser = address.toString();

                        if (listingOwner === currentUser) {
                            fetchedListings.push(listing);
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch listing ${i}`, e);
                }
            }

            setListings(fetchedListings);

        } catch (e) {
            console.error("Error fetching listings:", e);
        }
        setIsLoading(false);
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
                    <span className="text-cyan-400 font-medium cursor-default">Dashboard</span>
                    <Link href="/stats" className="hover:text-white transition hover:scale-105 duration-200">Stats</Link>
                    <Link href="/docs" className="hover:text-white transition hover:scale-105 duration-200">Docs</Link>
                    <Link href="/go-live" className="hover:text-white transition hover:scale-105 duration-200">Go Live</Link>
                </div>
                <button
                    onClick={connectWallet}
                    className="bg-white/10 border border-white/10 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-white/20 transition backdrop-blur-md flex items-center gap-2"
                >
                    <Wallet className="w-4 h-4" />
                    {walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "Connect Wallet"}
                </button>
            </nav>

            <div className="flex-1 max-w-7xl mx-auto w-full p-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
                        <p className="text-zinc-400">Manage your deployed applets and sales.</p>
                        <p className="text-zinc-600 text-xs font-mono mt-2 flex items-center gap-2">
                            Contract: {CONTRACT_ID.slice(0, 6)}...{CONTRACT_ID.slice(-6)}
                        </p>
                    </div>
                    <button onClick={() => walletAddress && fetchListings(walletAddress)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition" title="Refresh">
                        <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {!walletAddress ? (
                    <div className="border border-dashed border-white/10 rounded-3xl p-20 text-center bg-white/5">
                        <Wallet className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                        <p className="text-zinc-400 mb-6">Connect your wallet to view your listed applets.</p>
                        <button onClick={connectWallet} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition">
                            Connect Freighter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.length === 0 && !isLoading && (
                            <div className="col-span-full border border-dashed border-white/10 rounded-3xl p-12 text-center">
                                <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500">No applets found. <Link href="/go-live" className="text-cyan-400 hover:underline">List one now!</Link></p>
                            </div>
                        )}

                        {listings.map((item: any) => (
                            <div key={item.id} className="bg-[#09090b]/80 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition shadow-lg flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-cyan-900/20 rounded-xl">
                                        <Layers className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <span className="px-2 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded-full font-medium">Active</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1 truncate" title={item.name}>{item.name}</h3>
                                <p className="text-zinc-500 text-xs font-mono mb-4">ID: #{item.id}</p>

                                <div className="flex-1">
                                    <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-zinc-400 mb-4 h-24 overflow-hidden relative">
                                        {item.code_uri}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none"></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-lg font-bold">{Number(item.price)} XLM</span>
                                    {/* Future: Add Edit/Delist Listing */}
                                    <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition">
                                        View Code
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
