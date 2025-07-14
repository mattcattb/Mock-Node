import { zodCryptoCoinEnum } from "@/common/zod";
import { z } from "zod/v4";
export const coinParamSchema = z.object({
  coin: zodCryptoCoinEnum,
});

export const createWithdrawalJsonSchema = z.object({
  address: z.string(),
  amount: z.string(),
});

export const scanJsonSchema = z.object({
  lastProcessedBlockHash: z.string().optional(),
  pendingTransactions: z.array(z.string()).optional(),
});
