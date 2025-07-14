import { zodCryptoCoinEnum } from "@/common/zod";
import z from "zod/v4";

export const simulateDepositSchema = z.object({
  toAddress: z.string(),
  fromAddress: z.string().optional(),
  amount: z.string(),
});
