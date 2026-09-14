import { db } from "@/db";
import { conversations, conversationDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getConversation } from "@/services/conversation.service";
import { incrementQueryCount } from "@/services/user.service";
import {
  signConversationToken,
  verifyConversationToken,
} from "@/lib/conversation-token";

async function runBenchmark() {
  console.log("=== Benchmark: JWT Token Preflight vs Redis Preflight ===\n");

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

  // Warm-up caches
  const conv = await getConversation(userId, conversationId);
  await incrementQueryCount(userId);

  if (!conv) {
    console.log("Failed to load conversation");
    process.exit(1);
  }

  // 1. Benchmark Token Signing
  const signStart = performance.now();
  const token = await signConversationToken({
    userId,
    conversationId,
    documentIds: conv.documentIds,
  });
  const signDuration = performance.now() - signStart;
  console.log(`[Token Minting] Generated signed token in ${signDuration.toFixed(3)} ms`);

  console.log("\nRunning 3 consecutive iterations comparing both preflight modes...\n");

  for (let i = 1; i <= 3; i++) {
    // Mode A: Fallback Path (Redis getConversation + Redis incrementQueryCount concurrently)
    const startA = performance.now();
    const t0 = performance.now();
    await Promise.all([
      getConversation(userId, conversationId),
      incrementQueryCount(userId),
    ]);
    const durationA = performance.now() - startA;

    // Mode B: Fast Path (In-memory JWT verification + Redis incrementQueryCount only)
    const startB = performance.now();
    const tJwt0 = performance.now();
    const payload = await verifyConversationToken(token);
    const tJwtDuration = performance.now() - tJwt0;
    
    // Only query count hits Redis!
    await incrementQueryCount(userId);
    const durationB = performance.now() - startB;

    console.log(`[Run #${i}]`);
    console.log(`  Mode A (Redis Lookup + Quota): ${durationA.toFixed(1)} ms`);
    console.log(`  Mode B (JWT In-Memory + Quota): ${durationB.toFixed(1)} ms (JWT verify: ${tJwtDuration.toFixed(3)} ms)`);
    console.log(`  ⚡ Fast Path Delta           : ${(durationA - durationB).toFixed(1)} ms difference\n`);
  }

  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
