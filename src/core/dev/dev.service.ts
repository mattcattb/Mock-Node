import { zodCryptoCoinEnum } from "@/common/zod";
import db from "@/db/client";
import {
  blocks,
  cryptoCoinEnum,
  transactions,
  transactionStatusEnum,
} from "@/db/schema";
import { and, desc, eq, inArray, isNull, min, sql } from "drizzle-orm";
import { Database } from "@/db";
import { createChildLogger } from "@/common/hono/logger";
import { generateCoinBlockInfo } from "@/utils/blockchain-mock/block-gen";
import { AddressGenUtils, TransactionGenUtils } from "@/utils";
import type { CryptoCoin, RpcBlock, RpcTransaction } from "@/common/types";
import { rpcTransactionSchema } from "@/common/database.schemas";
import { simulateDepositSchema } from "@/core/dev/dev.schemas";
import { z } from "zod/v4";
import * as RpcService from "../rpc.service";
import { MiningError } from "@/common/exceptions";

const logger = createChildLogger("dev-service");

const EXTERNAL_WORLD_ADDRESS = "m73k-outside-world-address-zzzz";

export async function simulateDeposit(
  coin: CryptoCoin,
  json: z.infer<typeof simulateDepositSchema>
) {
  const { amount, toAddress } = json;

  const fromAddress = `external_word_address_${coin}`;

  const newTransaction = await RpcService.createTransaction({
    amount,
    category: "receive",
    coin,
    fromAddress,
    toAddress,
  });

  return { txid: newTransaction.txid };
}

const TRANSACTIONS_PER_BLOCK = 10;
const BLOCK_SIZE = 1000;

const allCoins = cryptoCoinEnum.enumValues;

export async function mineAll() {
  const miningPromises = cryptoCoinEnum.enumValues.map((coin) => mine(coin));

  const responses = await Promise.all(miningPromises);

  return responses;
}

export async function mine(coin: CryptoCoin) {
  try {
    let minedTransactions: RpcTransaction[] = [];
    let newBlock: RpcBlock | null = null;
    return await Database.transaction(async (tx) => {
      const latestBlock = await tx.query.blocks.findFirst({
        where: eq(blocks.coin, coin),
        orderBy: desc(blocks.height),
      });

      const { hash, nonce, timestamp } = generateCoinBlockInfo(coin);

      await tx.insert(blocks).values({
        height: latestBlock ? latestBlock.height + 1 : 1,
        previousHash: latestBlock ? latestBlock.hash : null,
        hash,
        coin,
        size: BLOCK_SIZE,
        nonce,
        transactionCount: TRANSACTIONS_PER_BLOCK,
      });

      const transactionsToConfirm = await tx.query.transactions.findMany({
        where: and(eq(transactions.coin, coin), isNull(transactions.blockHash)),
        limit: 5,
      });

      if (transactionsToConfirm.length > 0) {
        const transactionsWithConfirmations = transactionsToConfirm.map(
          (transaction) => ({
            ...transaction,
            confirmations: 1,
          })
        );
        minedTransactions = z
          .array(rpcTransactionSchema)
          .parse(transactionsWithConfirmations);
        const txidsConfirmedInBlock = transactionsToConfirm.map((t) => t.txid);
        logger.info(
          { transactionsToConfirm },
          `Confirming ${transactionsToConfirm.length} transactions in block ${hash}: ${txidsConfirmedInBlock.join(", ")}`
        );

        await tx
          .update(transactions)
          .set({
            blockHash: hash,
            confirmedAt: new Date(),
          })
          .where(
            and(
              eq(transactions.coin, coin),
              isNull(transactions.blockHash),
              inArray(transactions.txid, txidsConfirmedInBlock)
            )
          );

        // Update the transactionCount for the new block
        const [createdBlock] = await tx
          .update(blocks)
          .set({ transactionCount: transactionsToConfirm.length })
          .where(and(eq(blocks.hash, hash), eq(blocks.coin, coin)))
          .returning();

        newBlock = createdBlock;
      } else {
        logger.info(
          `No pending transactions to confirm in block ${hash} for ${coin}.`
        );
      }
      return {
        newBlock,
        minedTransactions,
      };
    });
  } catch (error) {
    throw new MiningError(`Failed to mine block for ${coin}`, { cause: error });
  }
}

export async function reset() {
  // resets tables
}
