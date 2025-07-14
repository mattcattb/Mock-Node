import { createChildLogger } from "@/common/hono/logger";
import type { CryptoCoin } from "@/common/types";
import type { RPCTransactionEvent } from "@/common/types";
import * as RPCService from "../rpc.service";
import {
  getTransactionKey,
  parseTransactionKey,
} from "@/utils/blockchain-mock/transaction-gen";
import z from "zod/v4";
import { createWithdrawalJsonSchema, scanJsonSchema } from "./node.schemas";
import { env } from "@/common/env";

const logger = createChildLogger("common-service");

export async function generateAddress(coin: CryptoCoin) {
  const address = await RPCService.getNewAddress(coin);
  return address;
}

export async function getBalance(coin: CryptoCoin) {
  const balanceResults = await RPCService.getBalances(coin);

  return balanceResults;
}

export async function scan(
  coin: CryptoCoin,
  json: z.infer<typeof scanJsonSchema>
) {
  const { lastProcessedBlockHash, pendingTransactions } = json;
  // first, lets get the list of transactions since the last block!

  const { blockhash: rpcBlockhash, transactions: rpcTransactions } =
    await RPCService.listSinceBlock({
      coin,
      blockHash: lastProcessedBlockHash,
    });

  logger.debug(
    `Received ${rpcTransactions.length} transactions up to block ${rpcBlockhash}`
  );

  const newPendingTransactions = new Set<string>(pendingTransactions);
  const processingTransactions = new Set<string>();

  const events: RPCTransactionEvent[] = [];

  for (const transaction of rpcTransactions) {
    if (transaction.category !== "receive" && transaction.category !== "send")
      continue;

    const key = getTransactionKey(transaction.txid, transaction.vout);
    processingTransactions.add(key);

    if (transaction.confirmations >= 1) {
      events.push({
        type: "transaction:confirmed",
        category: transaction.category,
        txid: transaction.txid,
        vout: transaction.vout,
        address: transaction.address,
        amount: transaction.amount,
        fee: transaction.fee,
        confirmations: transaction.confirmations,
      });

      newPendingTransactions.delete(key);
      logger.debug(`Transaction confirmed: ${key}`);
    } else {
      if (newPendingTransactions.has(key)) {
        logger.debug(`Transaction still pending: ${key}`);
        continue;
      }

      events.push({
        type: "transaction:pending",
        category: transaction.category,
        txid: transaction.txid,
        vout: transaction.vout,
        address: transaction.address,
        amount: transaction.amount,
        fee: transaction.fee,
      });

      newPendingTransactions.add(key);
      logger.debug(`Transaction pending: ${key}`);
    }
  }

  for (const key of newPendingTransactions) {
    if (processingTransactions.has(key)) continue;

    const { txid, vout } = parseTransactionKey(key);

    events.push({
      type: "transaction:cancelled",
      txid,
      vout,
    });

    logger.debug(`Transaction cancelled: ${key}`);
  }

  return {
    events,
    newState: {
      lastProcessedBlockHash: lastProcessedBlockHash,
      pendingTransactions: [...newPendingTransactions],
    },
  };
}

export async function createWithdrawal(
  coin: CryptoCoin,
  json: z.infer<typeof createWithdrawalJsonSchema>
) {
  const { address, amount } = json;

  //! setup custodial wallet addresses maybe?
  //! todo better fee system!

  const newTransaction = await RPCService.createTransaction({
    coin,
    amount,
    category: "send",
    fromAddress: env.INTERNAL_HOTWALLET_ADDRESS,
    toAddress: address,
  });

  return { txid: newTransaction.txid };
}
