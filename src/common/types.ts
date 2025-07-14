import type {
  rpcTransactionSchema,
  rpcBlockSchema,
} from "@/common/database.schemas";
import { cryptoCoinEnum } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cryptoCoinSchema = z.enum(cryptoCoinEnum.enumValues);
export type CryptoCoin = z.infer<typeof cryptoCoinSchema>;

declare module "hono" {
  interface ContextVariableMap {
    coin: CryptoCoin;
  }
}

export type RpcTransaction = z.infer<typeof rpcTransactionSchema>;

export type RpcBlock = z.infer<typeof rpcBlockSchema>;
export type RPCTransactionPendingEvent = {
  type: "transaction:pending";
  category: "send" | "receive";
  txid: string;
  vout: number;
  address: string;
  amount: string;
  fee: string;
};
export type RPCTransactionConfirmedEvent = {
  type: "transaction:confirmed";
  category: "send" | "receive";
  txid: string;
  vout: number;
  address: string;
  amount: string;
  fee: string;
  confirmations: number;
};
export type RPCTransactionCancelledEvent = {
  type: "transaction:cancelled";
  txid: string;
  vout: number;
};

export type RPCTransactionEvent =
  | RPCTransactionPendingEvent
  | RPCTransactionConfirmedEvent
  | RPCTransactionCancelledEvent;
