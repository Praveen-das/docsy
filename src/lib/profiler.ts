/**
 * ANSI Color codes and labels for distinctive performance profiling in terminal logs.
 */
export const TIMERS = {
  auth: "\x1b[1;95m⚡ [AUTH]\x1b[0m",
  conv: "\x1b[1;94m🔍 [GET_CONVERSATION]\x1b[0m",
  quota: "\x1b[1;93m📊 [DAILY_QUOTA_CHECK]\x1b[0m",
  persist: "\x1b[1;92m💾 [PERSIST_MESSAGE]\x1b[0m",
  rag: "\x1b[1;96m🧠 [RAG_PIPELINE]\x1b[0m",
  stream: "\x1b[1;91m🚀 [STREAM_LLM]\x1b[0m",
} as const;

export type TimerKey = keyof typeof TIMERS;

/**
 * Utility to run an operation while logging its execution duration with a colored ANSI timer badge.
 * Supports both synchronous and asynchronous functions.
 */
export async function timeOperation<T>(timerKey: TimerKey, fn: () => Promise<T> | T): Promise<T> {
  const label = TIMERS[timerKey];
  console.time(label);
  try {
    return await fn();
  } finally {
    console.timeEnd(label);
  }
}
