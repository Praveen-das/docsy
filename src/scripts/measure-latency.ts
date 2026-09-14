import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "@/db";
import { conversations, conversationDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getConversation, getMessages } from "@/services/conversation.service";
import { incrementQueryCount } from "@/services/user.service";
import { executeRAG } from "@/services/rag.service";
import { getChatModel } from "@/lib/ai";
import { streamText } from "ai";

async function runBenchmark() {
  console.log("=== Latency Profile for /api/conversations/[id]/messages/stream ===");

  // 1. Find a real conversation with linked documents
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
    console.log("No conversations found in database to test with.");
    process.exit(0);
  }

  const userId = convRecord.userId;
  const conversationId = convRecord.id;
  const testQuery = "What are the main key points discussed in this document?";

  console.log(`Testing with Conversation ID: ${conversationId}`);
  console.log(`User ID: ${userId}`);
  console.log(`Query: "${testQuery}"\n`);

  async function measureIteration(iterationName: string) {
    console.log(`\n--- Running ${iterationName} ---`);

    // Step 1: getConversation (AuthZ & Document IDs)
    const t0 = performance.now();
    const conv = await getConversation(userId, conversationId);
    const t1 = performance.now();
    const convTime = t1 - t0;

    if (!conv || !conv.documentIds || conv.documentIds.length === 0) {
      console.log("No document IDs linked to conversation.");
      process.exit(0);
    }

    // Step 2: Quota Check (Atomic Redis INCR)
    const t2 = performance.now();
    const quotaAllowed = await incrementQueryCount(userId);
    const t3 = performance.now();
    const quotaTime = t3 - t2;

    // Step 3: getMessages (History Lookup)
    const t4 = performance.now();
    const allMessages = await getMessages(userId, conversationId);
    const t5 = performance.now();
    const historyTime = t5 - t4;

    const conversationHistory = allMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Step 4: RAG Pipeline (Embedding + Pinecone Retrieval)
    const t6 = performance.now();
    const ragResult = await executeRAG(userId, testQuery, conv.documentIds, conversationHistory);
    const t7 = performance.now();
    const ragTime = t7 - t6;

    // Step 5: Streaming LLM Response
    const t8 = performance.now();
    let firstTokenTime: number | null = null;
    let tokenCount = 0;
    let fullText = "";

    const result = streamText({
      model: getChatModel(),
      system: ragResult.systemPrompt,
      messages: ragResult.promptMessages,
    });

    for await (const chunk of result.textStream) {
      if (firstTokenTime === null) {
        firstTokenTime = performance.now();
      }
      tokenCount++;
      fullText += chunk;
    }
    const t9 = performance.now();

    const ttft = firstTokenTime ? firstTokenTime - t8 : t9 - t8;
    const streamDuration = firstTokenTime ? t9 - firstTokenTime : 0;
    const totalTTFT = convTime + quotaTime + historyTime + ragTime + ttft;

    return {
      iterationName,
      convTime,
      quotaTime,
      historyTime,
      ragTime,
      ttft,
      totalTTFT,
      streamDuration,
      totalTime: totalTTFT + streamDuration,
      tokenCount,
    };
  }

  const cold = await measureIteration("Cold Run (First Request)");
  const warm = await measureIteration("Warm Run (Cached Connections & Redis)");

  console.log("\n=======================================================");
  console.log("            LATENCY BENCHMARK REPORT                   ");
  console.log("=======================================================");
  console.log("Metric                              | Cold Run   | Warm Run  ");
  console.log("------------------------------------+------------+-----------");
  console.log(`1. AuthZ & Doc IDs (Redis cached)   | ${cold.convTime.toFixed(1).padStart(7)} ms | ${warm.convTime.toFixed(1).padStart(7)} ms`);
  console.log(`2. Quota Check (Atomic Redis INCR)  | ${cold.quotaTime.toFixed(1).padStart(7)} ms | ${warm.quotaTime.toFixed(1).padStart(7)} ms`);
  console.log(`3. History Retrieval (Redis cached) | ${cold.historyTime.toFixed(1).padStart(7)} ms | ${warm.historyTime.toFixed(1).padStart(7)} ms`);
  console.log(`4. RAG (Embedding + Pinecone TopK)  | ${cold.ragTime.toFixed(1).padStart(7)} ms | ${warm.ragTime.toFixed(1).padStart(7)} ms`);
  console.log(`5. Gemini API TTFT                  | ${cold.ttft.toFixed(1).padStart(7)} ms | ${warm.ttft.toFixed(1).padStart(7)} ms`);
  console.log("------------------------------------+------------+-----------");
  console.log(`TOTAL TIME TO FIRST TOKEN (TTFT)    | ${cold.totalTTFT.toFixed(1).padStart(7)} ms | ${warm.totalTTFT.toFixed(1).padStart(7)} ms`);
  console.log(`Streaming Duration                  | ${cold.streamDuration.toFixed(1).padStart(7)} ms | ${warm.streamDuration.toFixed(1).padStart(7)} ms`);
  console.log(`TOTAL COMPLETION TIME               | ${cold.totalTime.toFixed(1).padStart(7)} ms | ${warm.totalTime.toFixed(1).padStart(7)} ms`);
  console.log("=======================================================\n");

  process.exit(0);
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
