import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEFAULT_ASSET_IDS = [
  "bitcoin", "ethereum", "tether", "binancecoin", "solana",
  "ripple", "usd-coin", "cardano", "dogecoin", "tron",
  "avalanche-2", "chainlink", "polkadot", "matic-network", "litecoin",
  "shiba-inu", "bitcoin-cash", "uniswap", "internet-computer", "ethereum-classic",
  "stellar", "monero", "okb", "cosmos", "hedera-hashgraph",
  "filecoin", "aptos", "crypto-com-chain", "near", "vechain",
  "arbitrum", "optimism", "maker", "quant-network", "algorand",
  "the-graph", "fantom", "tezos", "theta-token", "elrond-erd-2",
  "eos", "flow", "axie-infinity", "aave", "pancakeswap-token",
  "decentraland", "the-sandbox", "chiliz", "gala", "kucoin-shares"
];

async function main() {
  for (const asset_id of DEFAULT_ASSET_IDS) {
    await prisma.monitoredAsset.upsert({
      where: { asset_id },
      update: {},
      create: { asset_id, added_by: null },
    });
  }
  console.log(`Seeded ${DEFAULT_ASSET_IDS.length} default assets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
