import { createChildLogger } from "@/common/hono/logger";
import { schemas } from "@/db";
import db, { connection } from "@/db/client";
import { getTableName, is, sql, Table } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

const logger = createChildLogger("truncate-db-script");

export async function truncateDatabase(quiet = false) {
  if (quiet) {
    // Suppress notices and warnings during the truncate process for cleaner logs.
    await db.execute(sql`SET client_min_messages TO 'WARNING';`);
  }

  logger.info("Truncating all mock-node database tables...");

  // Introspect the schema to find all table objects
  const tables = Object.values(schemas).filter(
    (value: unknown): value is PgTable<any> => is(value, PgTable)
  );

  if (tables.length === 0) {
    logger.warn("No tables found in schema to truncate.");
    return;
  }

  // Get a comma-separated list of table names, properly quoted.
  const tableNames = tables
    .map((t) => `"${getTableName(t as Table)}"`)
    .join(", ");

  await db.execute(
    sql`TRUNCATE TABLE ${sql.raw(tableNames)} RESTART IDENTITY CASCADE;`
  );

  logger.info("✅ All tables truncated successfully.");
}

async function main() {
  try {
    await truncateDatabase();
  } catch (error) {
    logger.error({ error }, "An error occurred while truncating the database.");
    process.exit(1);
  } finally {
    logger.info("Closing database connection.");
    await connection.end();
  }
}

await main();
