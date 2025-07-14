import { z } from "zod/v4";

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug"])
    .default("info"),
});

const mockNodeSchema = baseSchema.extend({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.url("mock DATABASE_URL must be a valid URL"),
  INTERNAL_HOTWALLET_ADDRESS: z.string(),
});
export const env = mockNodeSchema.parse(process.env);
