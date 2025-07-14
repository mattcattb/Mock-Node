import { env } from "@/common/env";
import { createChildLogger } from "@/common/hono/logger";
import type { CryptoCoin } from "@/common/types";
import { DevService } from "@/core";
import { connection } from "@/db/client";
import { cryptoCoinEnum } from "@/db/schema";
import { formatCoin } from "@/utils/format";
import Decimal from "decimal.js";

const logger = createChildLogger("provision-nodes-script");

const allCoins = cryptoCoinEnum.enumValues;

const INTERNAL_HOTWALLET_ADDRESS = env.INTERNAL_HOTWALLET_ADDRESS;

const coinAmountConfig: Record<CryptoCoin, number> = {
  btc: 400,
  eth: 20,
  ltc: 23,
  usdc: 1000000,
  usdt: 1000000,
};

async function provisionWallets() {
  logger.info("--- Beginning Node Provisioning ---");

  for (const coin of allCoins) {
    try {
      const provisionAmount = coinAmountConfig[coin];

      logger.info(
        `Simulating deposit of ${provisionAmount} ${coin.toUpperCase()} to ${INTERNAL_HOTWALLET_ADDRESS}...`
      );

      const response = await DevService.simulateDeposit(coin, {
        amount: formatCoin(new Decimal(provisionAmount)),
        toAddress: INTERNAL_HOTWALLET_ADDRESS,
      });
      logger.info(`Deposit transaction created: ${response.txid}`);

      logger.info(
        `Mining a new block for ${coin.toUpperCase()} to confirm transactions...`
      );
      const results = await DevService.mine(coin);
      const txCount = results.minedTransactions?.length ?? 0;
      logger.info(
        `New block mined (${results.newBlock?.hash}). Confirmed ${txCount} transactions.`
      );

      logger.info(
        `Successfully provisioned and funded hot wallet for ${coin.toUpperCase()}.`
      );
    } catch (err) {
      logger.error({ err }, `Failed to provision ${coin.toUpperCase()}`);
    }
  }
}

export async function main() {
  try {
    await provisionWallets();
  } catch (error) {
    logger.error({ error }, "Error occured provisioning database hotwallets!");
    process.exit(1);
  } finally {
    logger.info("Closing db connection.");
    await connection.end();
  }
}

await main();
