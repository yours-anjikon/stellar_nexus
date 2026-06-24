import { Keypair, rpc } from "@stellar/stellar-sdk";
import { TariffShieldClient } from "@tariffshield/sdk";
import { env } from "./env.js";

export const platformKeypair = Keypair.fromSecret(env.PLATFORM_STELLAR_SECRET);
export const suretyKeypair = Keypair.fromSecret(env.SURETY_STELLAR_SECRET);

export const contractClient = new TariffShieldClient({
  rpcUrl: env.STELLAR_RPC_URL,
  contractId: env.TARIFF_SHIELD_CONTRACT_ID,
  networkPassphrase: env.STELLAR_NETWORK_PASSPHRASE,
});

export const explorerTx = (hash: string): string =>
  `https://stellar.expert/explorer/${env.STELLAR_NETWORK}/tx/${hash}`;

export async function getCurrentLedgerSequence(): Promise<number> {
  const server = new rpc.Server(env.STELLAR_RPC_URL, {
    allowHttp: env.STELLAR_RPC_URL.startsWith("http://"),
  });
  const latest = await server.getLatestLedger();
  return latest.sequence;
}
