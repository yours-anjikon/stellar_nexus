import { TariffShieldClient } from "../packages/sdk/src/index.js";
import deployments from "../deployments.json" with { type: "json" };

async function main() {
  const client = new TariffShieldClient({
    rpcUrl: deployments.rpcUrl,
    contractId: deployments.contractId,
    networkPassphrase: deployments.networkPassphrase,
  });

  console.log("admin :", await client.getAdmin());
  console.log("surety:", await client.getSurety());
  console.log("token :", await client.getToken());

  const acct = await client.getAccount(deployments.accounts.testImporter);
  console.log("test importer account:");
  console.log(JSON.stringify(
    {
      bondId: acct.bondId.toString(),
      collateralBalance: acct.collateralBalance.toString(),
      requiredCollateral: acct.requiredCollateral.toString(),
      reserveBalance: acct.reserveBalance.toString(),
      yieldAccrued: acct.yieldAccrued.toString(),
      isClawbacked: acct.isClawbacked,
    },
    null,
    2,
  ));
}

main().catch((e) => {
  console.error("smoke failed:", e);
  process.exit(1);
});
