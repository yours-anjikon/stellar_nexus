import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Horizon.Server(HORIZON_URL);

async function createAndFund(name: string) {
    const keypair = StellarSdk.Keypair.random();
    console.log(`Generating ${name}:`);
    console.log(`  Public: ${keypair.publicKey()}`);
    console.log(`  Secret: ${keypair.secret()}`);
    
    try {
        await axios.get(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
        console.log(`  Status: Funded!`);
        return keypair;
    } catch (e) {
        console.error(`  Status: Failed to fund ${name}`);
        return null;
    }
}

async function main() {
    console.log("=== Stellar Nexus User Generation Script ===");
    
    // 1. Create Sponsor
    const sponsor = await createAndFund("Nexus Treasury (Sponsor)");
    
    // 2. Create 30 Users
    const users = [];
    for (let i = 1; i <= 30; i++) {
        const user = await createAndFund(`User ${i}`);
        if (user) users.push(user.publicKey());
    }
    
    console.log("\n=== Summary for README ===");
    console.log("Sponsor Secret (Set this in .env as SPONSOR_SECRET):");
    console.log(sponsor?.secret());
    console.log("\nUser Addresses:");
    users.forEach((addr, i) => console.log(`${i+1}. ${addr}`));
}

main();
