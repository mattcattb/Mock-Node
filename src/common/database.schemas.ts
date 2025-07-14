import { transactions, addresses, blocks } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const rpcBaseTransactionSelectSchema = createSelectSchema(transactions);

export const rpcTransactionSchema = rpcBaseTransactionSelectSchema
  .extend({
    confirmations: z.number().int().nonnegative(),
  })
  .transform((dbTx) => {
    return {
      txid: dbTx.txid,
      vout: dbTx.vout,
      category: dbTx.category,
      amount: dbTx.amount,
      fee: dbTx.fee,
      confirmations: dbTx.confirmations,

      address: dbTx.category === "send" ? dbTx.fromAddress! : dbTx.toAddress!,
    };
  });

export const rpcAddressSchema = createSelectSchema(addresses).omit({
  coin: true,
});

export const rpcBlockSchema = createSelectSchema(blocks).omit({
  coin: true,
});
