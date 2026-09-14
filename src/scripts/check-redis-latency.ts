import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";
import { randomUUID } from "crypto";

interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
  stdDev: number;
}

interface RedisBenchmarkClient {
  protocol: "TCP (ioredis)" | "HTTP REST (@upstash/redis)";
  endpoint: string;
  maskedUrl: string;
  ping(): Promise<unknown>;
  set(key: string, value: string, ttlSeconds: number): Promise<unknown>;
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  pipeline(operations: Array<{ key: string; value: string; ttl: number }>): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  close(): Promise<void>;
}

class IoRedisAdapter implements RedisBenchmarkClient {
  protocol = "TCP (ioredis)" as const;
  endpoint: string;
  maskedUrl: string;
  private client: IORedis;

  constructor(url: string) {
    this.client = new IORedis(url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: false,
    });

    try {
      const parsed = new URL(url);
      this.endpoint = `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`;
      this.maskedUrl = `${parsed.protocol}//${parsed.username ? `${parsed.username}:` : ""}****@${this.endpoint}`;
    } catch {
      this.endpoint = url.replace(/.*@/, "");
      this.maskedUrl = "rediss://****";
    }
  }

  async ping(): Promise<unknown> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<unknown> {
    return this.client.set(key, value, "EX", ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async pipeline(operations: Array<{ key: string; value: string; ttl: number }>): Promise<unknown> {
    const pipe = this.client.pipeline();
    for (const op of operations) {
      pipe.set(op.key, op.value, "EX", op.ttl);
    }
    return pipe.exec();
  }

  async del(...keys: string[]): Promise<unknown> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  async close(): Promise<void> {
    await this.client.quit().catch(() => this.client.disconnect());
  }
}

class UpstashRestAdapter implements RedisBenchmarkClient {
  protocol = "HTTP REST (@upstash/redis)" as const;
  endpoint: string;
  maskedUrl: string;
  private client: UpstashRedis;

  constructor(url: string, token: string) {
    this.client = new UpstashRedis({ url, token });
    try {
      const parsed = new URL(url);
      this.endpoint = parsed.hostname;
    } catch {
      this.endpoint = url;
    }
    const maskedToken =
      token.length > 8 ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "****";
    this.maskedUrl = `${url} [token: ${maskedToken}]`;
  }

  async ping(): Promise<unknown> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<unknown> {
    return this.client.set(key, value, { ex: ttlSeconds });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get<string>(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async pipeline(operations: Array<{ key: string; value: string; ttl: number }>): Promise<unknown> {
    const pipe = this.client.pipeline();
    for (const op of operations) {
      pipe.set(op.key, op.value, { ex: op.ttl });
    }
    return pipe.exec();
  }

  async del(...keys: string[]): Promise<unknown> {
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  async close(): Promise<void> {
    // Stateless HTTP REST client, no open sockets
  }
}

function resolveRedisClient(): RedisBenchmarkClient {
  const tcpUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Explicit TCP URL (rediss:// or redis://) in UPSTASH_REDIS_URL or REDIS_URL
  if (tcpUrl && (tcpUrl.startsWith("redis://") || tcpUrl.startsWith("rediss://"))) {
    return new IoRedisAdapter(tcpUrl);
  }

  // 2. Misplaced TCP URL in UPSTASH_REDIS_REST_URL
  if (restUrl && (restUrl.startsWith("redis://") || restUrl.startsWith("rediss://"))) {
    return new IoRedisAdapter(restUrl);
  }

  // 3. Valid HTTP REST Upstash configuration
  if (restUrl && restUrl.startsWith("https://") && restToken) {
    return new UpstashRestAdapter(restUrl, restToken);
  }

  // 4. If UPSTASH_REDIS_URL is provided without scheme prefix, check if it looks like TCP host:port
  if (tcpUrl && tcpUrl.includes(":")) {
    return new IoRedisAdapter(tcpUrl.startsWith("redis") ? tcpUrl : `redis://${tcpUrl}`);
  }

  console.error("❌ ERROR: No valid Redis configuration found.");
  console.error("\nFor TCP Redis / Valkey (via ioredis), configure one of:");
  console.error("  - UPSTASH_REDIS_URL=rediss://default:<password>@<host>:<port>");
  console.error("  - REDIS_URL=rediss://default:<password>@<host>:<port>");
  console.error("\nFor Upstash HTTP REST API (via @upstash/redis), configure:");
  console.error("  - UPSTASH_REDIS_REST_URL=https://<host>");
  console.error("  - UPSTASH_REDIS_REST_TOKEN=<token>\n");
  process.exit(1);
}

function calculateStats(samples: number[]): LatencyStats {
  if (samples.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, p90: 0, p95: 0, p99: 0, stdDev: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / sorted.length;

  const getPercentile = (p: number): number => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  };

  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    median: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
    stdDev,
  };
}

function parseCliArgs(): { iterations: number; verbose: boolean } {
  const args = process.argv.slice(2);
  let iterations = 10;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--iterations" || arg === "-n") {
      const val = parseInt(args[++i], 10);
      if (!isNaN(val) && val > 0) iterations = val;
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Redis Latency Benchmarking Tool (Supports TCP & HTTP REST)
Usage:
  npx tsx src/scripts/check-redis-latency.ts [options]

Options:
  -n, --iterations <number>   Number of test samples per operation (default: 10)
  -v, --verbose               Display detailed step-by-step timings
  -h, --help                  Show this help message
`);
      process.exit(0);
    }
  }

  return { iterations, verbose };
}

function formatMs(val: number): string {
  return `${val.toFixed(2)} ms`;
}

async function main() {
  const { iterations, verbose } = parseCliArgs();

  console.log("\n=======================================================");
  console.log("            REDIS LATENCY BENCHMARK TOOL               ");
  console.log("=======================================================\n");

  const client = resolveRedisClient();

  console.log(`🔌 Driver    : ${client.protocol}`);
  console.log(`📡 Endpoint  : ${client.endpoint}`);
  console.log(`🔗 Target    : ${client.maskedUrl}`);
  console.log(`🔄 Samples   : ${iterations} iterations per operation`);
  console.log("-------------------------------------------------------");

  const testRunId = randomUUID().slice(0, 8);
  const testKeyPrefix = `bench:latency:${testRunId}`;
  const testKey = `${testKeyPrefix}:kv`;
  const counterKey = `${testKeyPrefix}:counter`;

  try {
    // 1. Cold Start Test (first request measures DNS + TLS + connection handshake)
    console.log("\n[1/7] Measuring Initial Connection & Cold PING...");
    const coldStart = performance.now();
    await client.ping();
    const coldDuration = performance.now() - coldStart;
    console.log(`  ⚡ Initial Roundtrip: ${formatMs(coldDuration)}`);

    // 2. Warm PING roundtrip
    console.log(`\n[2/7] Benchmarking Warm PING (Network RTT across ${iterations} samples)...`);
    const pingSamples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await client.ping();
      const dur = performance.now() - t0;
      pingSamples.push(dur);
      if (verbose) console.log(`    Run #${i + 1}: ${formatMs(dur)}`);
    }

    // 3. SET (Write operation with TTL)
    console.log(`\n[3/7] Benchmarking SET with TTL (${iterations} samples)...`);
    const setSamples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const payload = JSON.stringify({ testId: testRunId, iter: i, timestamp: Date.now() });
      const t0 = performance.now();
      await client.set(testKey, payload, 60);
      const dur = performance.now() - t0;
      setSamples.push(dur);
      if (verbose) console.log(`    Run #${i + 1}: ${formatMs(dur)}`);
    }

    // 4. GET (Cache Hit)
    console.log(`\n[4/7] Benchmarking GET [Hit] (${iterations} samples)...`);
    const getHitSamples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await client.get(testKey);
      const dur = performance.now() - t0;
      getHitSamples.push(dur);
      if (verbose) console.log(`    Run #${i + 1}: ${formatMs(dur)}`);
    }

    // 5. GET (Cache Miss)
    console.log(`\n[5/7] Benchmarking GET [Miss / Key Nonexistent] (${iterations} samples)...`);
    const getMissSamples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const nonExistentKey = `${testKeyPrefix}:non_existent_${i}`;
      const t0 = performance.now();
      await client.get(nonExistentKey);
      const dur = performance.now() - t0;
      getMissSamples.push(dur);
      if (verbose) console.log(`    Run #${i + 1}: ${formatMs(dur)}`);
    }

    // 6. INCR (Atomic Counter - Docsy Quota Flow)
    console.log(`\n[6/7] Benchmarking Atomic INCR (Used in User Rate Limiting & Quotas)...`);
    const incrSamples: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await client.incr(counterKey);
      const dur = performance.now() - t0;
      incrSamples.push(dur);
      if (verbose) console.log(`    Run #${i + 1}: ${formatMs(dur)}`);
    }

    // 7. Pipeline vs Sequential (5 Operations)
    console.log(`\n[7/7] Benchmarking Pipeline vs Sequential Multi-Command Execution...`);

    // Sequential 5 calls
    const seqStart = performance.now();
    for (let j = 0; j < 5; j++) {
      await client.set(`${testKeyPrefix}:p_${j}`, `value_${j}`, 60);
    }
    const seqDuration = performance.now() - seqStart;

    // Pipeline 5 calls
    const pipeStart = performance.now();
    const pipeOps = [];
    for (let j = 0; j < 5; j++) {
      pipeOps.push({ key: `${testKeyPrefix}:p_${j}`, value: `value_${j}`, ttl: 60 });
    }
    await client.pipeline(pipeOps);
    const pipeDuration = performance.now() - pipeStart;

    const pipelineSpeedup = (seqDuration / Math.max(pipeDuration, 0.01)).toFixed(2);
    console.log(`  Sequential (5x roundtrips): ${formatMs(seqDuration)}`);
    console.log(`  Pipeline   (1x roundtrip) : ${formatMs(pipeDuration)}`);
    console.log(`  ⚡ Speedup Multiplier     : ${pipelineSpeedup}x faster`);

    // Compute stats
    const pingStats = calculateStats(pingSamples);
    const setStats = calculateStats(setSamples);
    const getHitStats = calculateStats(getHitSamples);
    const getMissStats = calculateStats(getMissSamples);
    const incrStats = calculateStats(incrSamples);

    // Summary Report
    console.log("\n==========================================================================");
    console.log("                        LATENCY STATISTICAL SUMMARY                       ");
    console.log("==========================================================================");
    console.log("Operation     | Min      | Max      | Mean (Avg) | Median   | P95      | Jitter (StdDev)");
    console.log("--------------+----------+----------+------------+----------+----------+----------------");

    const rows = [
      { name: "PING (RTT)", stats: pingStats },
      { name: "SET (Write)", stats: setStats },
      { name: "GET (Hit)", stats: getHitStats },
      { name: "GET (Miss)", stats: getMissStats },
      { name: "INCR (Quota)", stats: incrStats },
    ];

    for (const r of rows) {
      const name = r.name.padEnd(13);
      const min = formatMs(r.stats.min).padStart(8);
      const max = formatMs(r.stats.max).padStart(8);
      const avg = formatMs(r.stats.avg).padStart(10);
      const med = formatMs(r.stats.median).padStart(8);
      const p95 = formatMs(r.stats.p95).padStart(8);
      const std = formatMs(r.stats.stdDev).padStart(15);
      console.log(`${name} | ${min} | ${max} | ${avg} | ${med} | ${p95} | ${std}`);
    }

    console.log("--------------------------------------------------------------------------");
    console.log(`Cold Start Initial RTT: ${formatMs(coldDuration)}`);
    console.log(`Warm Average PING RTT : ${formatMs(pingStats.avg)}`);

    // Latency Health Grade
    console.log("\n==========================================================================");
    console.log("                        PERFORMANCE HEALTH RATING                         ");
    console.log("==========================================================================");

    const avgWarmPing = pingStats.avg;
    if (avgWarmPing < 15) {
      console.log("🟢 ULTRA-LOW LATENCY (< 15 ms)");
      console.log("   Redis is co-located (same datacenter/VPC). Perfect for real-time streaming preflight.");
    } else if (avgWarmPing < 40) {
      console.log("🟢 EXCELLENT (< 40 ms)");
      console.log("   Fast regional connection. Minimal overhead on API endpoints.");
    } else if (avgWarmPing < 90) {
      console.log("🟡 MODERATE (40 - 90 ms)");
      console.log("   Cross-region connection detected. Keep using concurrent Promise.all() for checks.");
    } else {
      console.log("🟠 ELEVATED LATENCY (> 90 ms)");
      console.log("   Significant network delay detected (likely cross-continental).");
      console.log("   Recommendation: Use in-memory Conversation JWTs to avoid Redis roundtrips during streaming.");
    }
    console.log("==========================================================================\n");
  } catch (error) {
    console.error("\n❌ Benchmark failed with error:", error);
    process.exit(1);
  } finally {
    // Cleanup temporary keys
    try {
      const keysToDelete = [testKey, counterKey];
      for (let j = 0; j < 5; j++) {
        keysToDelete.push(`${testKeyPrefix}:p_${j}`);
      }
      await client.del(...keysToDelete);
    } catch {
      // Ignore cleanup error
    }

    // Close client connection
    try {
      await client.close();
    } catch {
      // Ignore close error
    }
  }

  process.exit(0);
}

main();
