import { createChildLogger } from "@/common/hono/logger";
import db, { connection } from "@/db/client";
import { sql } from "drizzle-orm";

const logger = createChildLogger("wipe-db-script");

export async function wipeDatabase() {
  logger.warn(
    "🔥 Completely wiping the 'public' schema (all tables, types, etc.)..."
  );

  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);

  await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);

  logger.info("Schema 'public' has been wiped and recreated successfully.");
}

async function main() {
  try {
    await wipeDatabase();
  } catch (error) {
    logger.error({ error }, "An error occurred while wiping the database.");
    process.exit(1);
  } finally {
    logger.info("Closing database connection.");
    await connection.end();
  }
}

await main();
