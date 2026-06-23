const StellarSdk = require('@stellar/stellar-sdk');
const axios = require('axios');

const CONTRACT_ID = "CAAQBQS5XV4KB3TKY4CLLEXGQL2Y43D5HG2JPVKKBQ7CWYK2YXT7M5LE";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new StellarSdk.rpc.Server(RPC_URL);

async function createAndFund(name) {
    const keypair = StellarSdk.Keypair.random();
    console.log(`Generating ${name}:`);
    console.log(`  Public: ${keypair.publicKey()}`);
    
    try {
        await axios.get(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
        console.log(`  Status: Funded!`);
        return keypair;
    } catch (e) {
        console.error(`  Status: Failed to fund ${name}`);
        return null;
    }
}

async function interact(keypair) {
    try {
        // We need to wait a bit for the account to be created on Horizon/RPC
        await new Promise(r => setTimeout(r, 2000));
        
        const source = new StellarSdk.Account(keypair.publicKey(), "0"); // Placeholder sequence
        
        // Build invocation
        const tx = new StellarSdk.TransactionBuilder(source, {
            fee: "10000",
            networkPassphrase: NETWORK_PASSPHRASE
        })
        .addOperation(StellarSdk.Operation.invokeHostFunction({
            func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
                new StellarSdk.xdr.InvokeContractArgs({
                    contractAddress: new StellarSdk.Address(CONTRACT_ID).toScAddress(),
                    functionName: "get_stats",
                    args: [StellarSdk.nativeToScVal("User Verification Interaction", { type: 'string' })]
                })
            ),
            auth: []
        }))
        .setTimeout(30)
        .build();

        // Prepare and Sign
        const prepared = await server.prepareTransaction(tx);
        prepared.sign(keypair);
        
        const res = await server.sendTransaction(prepared);
        console.log(`  Interaction: ${res.status} (Hash: ${res.hash})`);
        return res.hash;
    } catch (e) {
        console.error(`  Interaction Failed: ${e.message}`);
        return null;
    }
}

async function main() {
    console.log("=== Stellar Nexus User Generation & Verification Script ===");
    
    // 1. Create Sponsor
    const sponsor = await createAndFund("Nexus Treasury (Sponsor)");
    
    // 2. Create 30 Users and Interact
    const users = [];
    for (let i = 1; i <= 30; i++) {
        const user = await createAndFund(`User ${i}`);
        if (user) {
            users.push({ public: user.publicKey(), hash: await interact(user) });
        }
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log("\n=== Summary for README ===");
    console.log("Sponsor Secret (Set this in .env as SPONSOR_SECRET):");
    console.log(sponsor ? sponsor.secret() : "FAILED");
    console.log("\nUser Addresses (Verifiable on Stellar Explorer):");
    users.forEach((u, i) => console.log(`${i+1}. ${u.public} (TX: ${u.hash})`));
}

main();
