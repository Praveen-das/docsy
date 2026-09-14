import { loadEnvConfig } from "@next/env";

// Automatically load .env / .env.local in CLI mode
loadEnvConfig(process.cwd());

import { ensureQuotaSyncSchedule } from "@/lib/qstash";

async function main() {
  console.log("Configuring QStash schedule for quota synchronization...");
  try {
    const result = await ensureQuotaSyncSchedule();
    console.log(`Successfully configured QStash schedule:`);
    console.log(`- Schedule ID: ${result.scheduleId}`);
    console.log(`- Status: ${result.status}`);
    console.log(`- Frequency: Every 5 minutes (*/5 * * * *)`);
    console.log(`- Target: /api/cron/sync-quotas`);
  } catch (error) {
    console.error("Failed to configure QStash schedule:", error);
    process.exit(1);
  }
}

main();
