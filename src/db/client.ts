import { env } from "@/common/env";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(env.DATABASE_URL, { max: 1 });

export const db = drizzlePostgresJs(client, { schema });

export const connection = client;

export type db = typeof db;
export const DBError = postgres.PostgresError;
export default db;
