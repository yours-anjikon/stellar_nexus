import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * 🚀 Stellar Nexus Fee Sponsorship API
 * This endpoint allows gasless transactions by wrapping a user's signed transaction
 * in a Fee Bump transaction sponsored by the Nexus Treasury, then submitting it
 * directly to the Soroban RPC from the server to avoid XDR serialization issues.
 */

const SPONSOR_SECRET = process.env.SPONSOR_SECRET || "SANWPSH2IOT6GCVS5YXIWYXODBQZFFHRTHHN5LPCHU4G6G2UB2AV4OVV";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export async function POST(req: NextRequest) {
    try {
        const { transactionXdr } = await req.json();

        if (!transactionXdr) {
            return NextResponse.json({ error: 'Missing transactionXdr' }, { status: 400 });
        }

        if (SPONSOR_SECRET === "SDZ...PLACEHOLDER") {
            console.warn("SPONSOR_SECRET not configured. Gasless mode will not work on-chain.");
            return NextResponse.json({ error: 'Sponsorship service not configured' }, { status: 501 });
        }

        // Extract XDR string if wrapped in an object (Freighter v6+ compatibility)
        let xdr = transactionXdr;
        if (typeof xdr !== 'string' && xdr && typeof xdr === 'object') {
            console.log("Sponsor API received object. Keys:", Object.keys(xdr));
            xdr = xdr.signedTxXdr || xdr.signedXdr || xdr.signedTransaction || xdr.xdr || xdr.transactionXdr;
        }

        if (typeof xdr !== 'string') {
            return NextResponse.json({ error: 'Invalid transactionXdr format' }, { status: 400 });
        }

        const sponsorKeypair = StellarSdk.Keypair.fromSecret(SPONSOR_SECRET);
        console.log("Sponsor public key:", sponsorKeypair.publicKey());

        // 1. Parse the user-signed inner transaction
        const innerTx = new StellarSdk.Transaction(xdr, NETWORK_PASSPHRASE);
        const innerFee = parseInt(innerTx.fee, 10);
        console.log(`Inner tx fee: ${innerFee}, source: ${innerTx.source}, ops: ${innerTx.operations.length}`);

        // 2. Build Fee Bump - fee MUST be >= inner tx fee
        const bumpFee = Math.max(innerFee + 100, 1000000).toString();
        console.log(`Fee bump fee: ${bumpFee}`);

        const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
            sponsorKeypair.publicKey(),
            bumpFee,
            innerTx,
            NETWORK_PASSPHRASE
        );

        // 3. Sign the fee bump with the sponsor's key
        feeBumpTx.sign(sponsorKeypair);

        // 4. Submit directly from the server (avoids client-side XDR issues)
        const server = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
        console.log("Submitting fee bump transaction to network...");
        const submission = await server.sendTransaction(feeBumpTx);
        console.log("Submission result:", JSON.stringify({
            status: submission.status,
            hash: submission.hash,
            errorResult: (submission as any).errorResult,
        }));

        if (submission.status === "ERROR") {
            const errorDetail = JSON.stringify((submission as any).errorResult);
            return NextResponse.json({ 
                error: `Network rejected transaction: ${errorDetail}`,
                hash: submission.hash,
                status: submission.status
            }, { status: 422 });
        }

        if (submission.status !== "PENDING") {
            return NextResponse.json({ 
                error: `Unexpected status: ${submission.status}`,
                hash: submission.hash,
                status: submission.status
            }, { status: 422 });
        }

        // 5. Poll for confirmation
        let txResult: StellarSdk.rpc.Api.GetTransactionResponse;
        let attempts = 0;
        do {
            await new Promise(r => setTimeout(r, 2000));
            txResult = await server.getTransaction(submission.hash);
            attempts++;
        } while (txResult.status === "NOT_FOUND" && attempts < 15);

        console.log("Final tx status:", txResult.status);

        return NextResponse.json({
            status: txResult.status,
            hash: submission.hash,
            sponsor: sponsorKeypair.publicKey(),
        });

    } catch (error: any) {
        console.error('Sponsorship Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
