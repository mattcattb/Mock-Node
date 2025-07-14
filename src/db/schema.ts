import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

const BLOCK_DEFAULT = 2000;

export const transactionCategoryEnum = t.pgEnum("transaction_category_enum", [
  "send",
  "receive",
]);

export const transactionStatusEnum = t.pgEnum("transaction_status_enum", [
  "confirmed",
  "pending",
  "cancelled",
]);

export const cryptoCoinEnum = t.pgEnum("crypto_coin_enum", [
  "btc",
  "ltc",
  "eth",
  "usdt",
  "usdc",
]);

export function balanceCoin() {
  return t.numeric({ precision: 36, scale: 18 });
}

export function timestamptz() {
  return t.timestamp({ withTimezone: true });
}
export const txCategoryEnum = t.pgEnum("tx_category_enum", [
  "deposit",
  "withdrawal",
]);

export const blocks = pgTable(
  "blocks",
  {
    hash: t.text().notNull(),
    coin: cryptoCoinEnum().notNull(),
    height: t.integer().notNull(),
    previousHash: t.text(),
    timestamp: timestamptz().defaultNow(),
    size: t.integer(),
    transactionCount: t.integer().notNull().default(0),
    createdAt: timestamptz().notNull().defaultNow(),
    nonce: t.bigint({ mode: "number" }).notNull().default(0),
  },
  (tb) => [t.primaryKey({ columns: [tb.hash, tb.coin] })]
);

export const blocksRelations = relations(blocks, ({ many }) => ({
  transactions: many(transactions),
}));

export const addresses = pgTable(
  "addresses",
  {
    address: t.text().primaryKey(),
    coin: cryptoCoinEnum().notNull(),
    createdAt: timestamptz().notNull().defaultNow(),
  },
  (tb) => [t.unique().on(tb.coin, tb.address), t.index().on(tb.coin)]
);

export const transactions = pgTable(
  "transactions",
  {
    txid: t.text().notNull(),
    coin: cryptoCoinEnum().notNull(),
    blockHash: t.text(),
    fromAddress: t.text(),
    toAddress: t.text().notNull(),
    amount: balanceCoin().notNull(),
    fee: balanceCoin().notNull(),
    vout: t.integer().notNull().default(0),
    category: transactionCategoryEnum().notNull(),
    createdAt: timestamptz().defaultNow(),
    confirmedAt: timestamptz(),
    cancelledAt: timestamptz(),
  },
  (tb) => [
    t.primaryKey({
      columns: [tb.txid, tb.coin],
    }),
    t.foreignKey({
      columns: [tb.blockHash, tb.coin],
      foreignColumns: [blocks.hash, blocks.coin],
    }),
  ]
);
