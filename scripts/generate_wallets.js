const StellarSdk = require('@stellar/stellar-sdk');
const axios = require('axios');

async function main() {
    console.log("=== Generating 35 Real Testnet Wallets ===");
    const wallets = [];
    for (let i = 1; i <= 35; i++) {
        const keypair = StellarSdk.Keypair.random();
        try {
            await axios.get(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
            console.log(`${i}. ${keypair.publicKey()}`);
            wallets.push(keypair.publicKey());
        } catch (e) {
            console.error(`${i}. Failed to fund ${keypair.publicKey()}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\n=== DONE ===");
}
main();
