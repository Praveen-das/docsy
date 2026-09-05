import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Connection pool for Aiven PostgreSQL.
 * `max: 10` keeps us within free-tier connection limits.
 * `ssl: "require"` enforces encrypted connections (Aiven default).
 */
const client = postgres(process.env.DATABASE_URL, {
  max: 10,
  ssl: "require",
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
