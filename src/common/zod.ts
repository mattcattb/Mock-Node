import z from "zod/v4";
import Decimal from "decimal.js";
import { cryptoCoinEnum, transactionCategoryEnum } from "@/db/schema";

export const zodDecimal = z.coerce
  .string()
  .refine((val) => !new Decimal(val).isNaN(), {
    message: "Invalid decimal amount",
  })
  .transform((val) => new Decimal(val));

export const txidParamSchema = z.object({
  txid: z.string(),
});
export const zodCryptoCoinEnum = z.enum(cryptoCoinEnum.enumValues);

export const zodTransactonCategoryEnum = z.enum(
  transactionCategoryEnum.enumValues
);
