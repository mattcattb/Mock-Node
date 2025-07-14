import type {
  PostgresJsDatabase,
  PostgresJsTransaction,
} from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import db from "./client";
import { AsyncLocalStorage } from "node:async_hooks";
import type { ExtractTablesWithRelations } from "drizzle-orm";

type Database = PostgresJsDatabase<typeof schema>;
type Transaction = PostgresJsTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type TxCallback<T> = (tx: Transaction) => Promise<T>;

const als = new AsyncLocalStorage<Transaction>();

export function transaction<T>(callback: TxCallback<T>): Promise<T> {
  const txCallback = (tx: Transaction) => als.run(tx, () => callback(tx));

  const tx = als.getStore();
  if (tx) return tx.transaction(txCallback);
  return db.transaction(txCallback);
}

export function getTx(): Transaction | undefined {
  return als.getStore();
}

export function getTxOrDb(): Transaction | Database {
  const tx = getTx();
  if (tx) return tx;

  return db;
}

export function requireTx(): Transaction {
  const tx = getTx();
  if (!tx)
    throw new Error(
      "Attempted to use a transaction outside of a transaction context"
    );
  return tx;
}
