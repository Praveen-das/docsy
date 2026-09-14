import { db } from "@/db";
import { conversations, conversationDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getConversation } from "@/services/conversation.service";
import { incrementQueryCount } from "@/services/user.service";

async function runPreflightBenchmark() {
  console.log("=== Benchmark: Route Preflight (AuthZ + Quota) Latency ===");

  const linkedConv = await db
    .select({
      conversationId: conversationDocuments.conversationId,
      documentId: conversationDocuments.documentId,
    })
    .from(conversationDocuments)
    .limit(1);

  let convRecord;
  if (linkedConv.length > 0) {
    const [c] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, linkedConv[0].conversationId))
      .limit(1);
    convRecord = c;
  } else {
    const [c] = await db.select().from(conversations).limit(1);
    convRecord = c;
  }

  if (!convRecord) {
    console.log("No conversations found to test.");
    process.exit(0);
  }

  const userId = convRecord.userId;
  const conversationId = convRecord.id;

  // Warm-up caches so we measure steady-state warm latency
  await getConversation(userId, conversationId);
  await incrementQueryCount(userId);

  console.log("\nMeasuring 3 consecutive warm iterations...\n");

  for (let i = 1; i <= 3; i++) {
    // 1. Sequential Execution (Old Way)
    const seqStart = performance.now();
    const t0 = performance.now();
    await getConversation(userId, conversationId);
    const t1 = performance.now();
    const t2 = performance.now();
    await incrementQueryCount(userId);
    const t3 = performance.now();
    const seqTotal = performance.now() - seqStart;

    // 2. Parallel Execution (Fix 2: Promise.all)
    const parStart = performance.now();
    await Promise.all([
      getConversation(userId, conversationId),
      incrementQueryCount(userId),
    ]);
    const parTotal = performance.now() - parStart;

    const savingsMs = seqTotal - parTotal;
    const savingsPct = ((savingsMs / seqTotal) * 100).toFixed(1);

    console.log(`[Run #${i}]`);
    console.log(`  Sequential (Old): ${seqTotal.toFixed(1)} ms (Conv: ${(t1 - t0).toFixed(1)}ms + Quota: ${(t3 - t2).toFixed(1)}ms)`);
    console.log(`  Parallel   (New): ${parTotal.toFixed(1)} ms`);
    console.log(`  ⚡ Improvement   : ${savingsMs.toFixed(1)} ms faster (${savingsPct}% reduction)\n`);
  }

  process.exit(0);
}

runPreflightBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
