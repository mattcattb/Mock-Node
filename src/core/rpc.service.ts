import { createChildLogger } from "@/common/hono/logger";
import type { CryptoCoin } from "@/common/types";
import { zodCryptoCoinEnum, zodTransactonCategoryEnum } from "@/common/zod";
import type { RpcTransaction } from "@/common/types";
import { Database } from "@/db";
import db from "@/db/client";
import { addresses, blocks, transactions } from "@/db/schema";
import { generateCoinAddress } from "@/utils/blockchain-mock/address-gen";
import { formatCoin } from "@/utils/format";
import { generateTxIdForCoin } from "@/utils/blockchain-mock/transaction-gen";
import Decimal from "decimal.js";
import { and, desc, eq, gt, isNotNull, isNull, or, sum } from "drizzle-orm";
import z from "zod/v4";
import { rpcTransactionSchema } from "@/common/database.schemas";
export async function reset() {}

const logger = createChildLogger("rpc-service");

export async function getBalances(coin: CryptoCoin) {
  return await Database.transaction(async (tx) => {
    const [latestBlock, confirmedBalanceRows, pendingBalanceRows] =
      await Promise.all([
        tx.query.blocks.findFirst({
          where: eq(blocks.coin, coin),
          orderBy: desc(blocks.height),
        }),
        tx
          .select({
            sum: sum(transactions.amount),
            category: transactions.category,
          })
          .from(transactions)
          .where(
            and(eq(transactions.coin, coin), isNotNull(transactions.blockHash))
          )
          .groupBy(transactions.category),

        tx
          .select({
            sum: sum(transactions.amount),
            category: transactions.category,
          })
          .from(transactions)
          .where(
            and(eq(transactions.coin, coin), isNull(transactions.blockHash))
          )
          .groupBy(transactions.category),
      ]);

    const confirmedReceived = new Decimal(
      confirmedBalanceRows.find((r) => r.category === "receive")?.sum ?? "0"
    );
    const confirmedSent = new Decimal(
      confirmedBalanceRows.find((r) => r.category === "send")?.sum ?? "0"
    );
    const trustedBalance = confirmedReceived.minus(confirmedSent);

    const pendingReceived = new Decimal(
      pendingBalanceRows.find((r) => r.category === "receive")?.sum ?? "0"
    );
    const untrustedPendingBalance = pendingReceived;

    return {
      mine: {
        trusted: formatCoin(trustedBalance),
        untrusted_pending: formatCoin(untrustedPendingBalance),
      },
      lastprocessedblock: {
        hash: latestBlock?.hash ?? null,
        height: latestBlock?.height ?? 0,
      },
    };
  });
}

export async function getNewAddress(coin: CryptoCoin) {
  const address = generateCoinAddress(coin);
  const [insertedAddress] = await db
    .insert(addresses)
    .values({ address, coin })
    .returning();
  return insertedAddress;
}

export const listSinceLastBlockSchema = z.object({
  blockHash: z.string().optional(),
  coin: zodCryptoCoinEnum,
});

export async function listSinceBlock(
  params: z.infer<typeof listSinceLastBlockSchema>
) {
  const { blockHash, coin } = params;

  return await Database.transaction(async (tx) => {
    let startingBlockHeight = 0;

    if (blockHash) {
      const startBlock = await tx.query.blocks.findFirst({
        where: eq(blocks.hash, blockHash),
        columns: {
          height: true,
          hash: true,
        },
      });
      if (startBlock) {
        startingBlockHeight = startBlock.height;
      } else {
        logger.warn(
          `Block hash ${blockHash} not found. Starting scan from the beginning for ${coin}.`
        );
      }
    }

    const latestBlockInDb = await tx.query.blocks.findFirst({
      where: eq(blocks.coin, coin),
      orderBy: (blocks, { desc }) => desc(blocks.height),
      columns: {
        hash: true,
        height: true,
      },
    });

    const latestBlockHash = latestBlockInDb?.hash ?? null;
    const latestBlockHeight = latestBlockInDb?.height ?? 0;

    const confirmedConditions = [
      eq(transactions.coin, coin),
      gt(blocks.height, startingBlockHeight),
      or(
        eq(transactions.category, "receive"),
        eq(transactions.category, "send")
      ),
      isNotNull(transactions.blockHash),
    ];

    const pendingConditions = [
      eq(transactions.coin, coin),
      or(
        eq(transactions.category, "receive"),
        eq(transactions.category, "send")
      ),
      isNull(transactions.blockHash),
    ];

    const confirmedTransactionsRows = await tx
      .select()
      .from(transactions)
      .leftJoin(
        blocks,
        and(
          eq(transactions.blockHash, blocks.hash),
          eq(transactions.coin, blocks.coin)
        )
      )
      .where(and(...confirmedConditions));

    const pendingTransactionsRows = await tx
      .select()
      .from(transactions)
      .where(and(...pendingConditions));

    const confirmedTxsWithConfirmations = confirmedTransactionsRows.map(
      (row) => {
        return {
          ...row.transactions,
          confirmations: latestBlockHeight - (row.blocks?.height ?? 0) + 1,
        };
      }
    );

    const pendingTxsWithConfirmations = pendingTransactionsRows.map((tx) => {
      return {
        ...tx,
        confirmations: 0,
      };
    });

    const allDbTxs = [
      ...confirmedTxsWithConfirmations,
      ...pendingTxsWithConfirmations,
    ];

    const allRelevantTxns = rpcTransactionSchema.array().parse(allDbTxs);

    const uniqueTxns = new Map<string, RpcTransaction>();
    for (const txn of allRelevantTxns) {
      const key = `${txn.txid}-${txn.vout}`;
      const existingTxn = uniqueTxns.get(key);

      if (!existingTxn || existingTxn.confirmations < txn.confirmations) {
        uniqueTxns.set(key, txn);
      }
    }

    return {
      transactions: Array.from(uniqueTxns.values()),
      blockhash: latestBlockHash,
    };
  });
}

export const createTransactionSchema = z.object({
  coin: zodCryptoCoinEnum,
  amount: z.string(),
  category: zodTransactonCategoryEnum,
  toAddress: z.string(),
  fromAddress: z.string(),
});

export async function createTransaction(
  params: z.infer<typeof createTransactionSchema>
) {
  const db = Database.getTxOrDb();
  const { coin, amount, category, toAddress, fromAddress } = params;
  const txid = generateTxIdForCoin(coin);
  const mockFee = "0.0001";

  const [newTransaction] = await db
    .insert(transactions)
    .values({
      coin,
      amount,
      category,
      toAddress,
      fromAddress,
      txid,
      fee: mockFee,
    })
    .returning();

  return newTransaction;
}
