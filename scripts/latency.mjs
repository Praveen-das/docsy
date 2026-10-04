#!/usr/bin/env node
/**
 * Endpoint latency check.
 * Usage: COOKIE="__session=..." node scripts/latency.mjs [url] [runs]
 * Copy the Cookie header from DevTools > Network (authed request) into COOKIE.
 * Run 1 is typically a cold start; stats are shown with and without it.
 */
const url = process.argv[2] ?? "https://docsy-one.vercel.app/api/conversations?limit=20&offset=0";
const runs = Number(process.argv[3] ?? 10);
const cookie = process.env.COOKIE;

const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))];
const stats = (ms) => {
  const s = [...ms].sort((a, b) => a - b);
  return `min ${s[0].toFixed(0)}  p50 ${pct(s, 50).toFixed(0)}  p95 ${pct(s, 95).toFixed(0)}  max ${s.at(-1).toFixed(0)} ms`;
};

const ttfbs = [];
const totals = [];
for (let i = 1; i <= runs; i++) {
  const t0 = performance.now();
  const res = await fetch(url, { headers: cookie ? { cookie } : {}, cache: "no-store" });
  const ttfb = performance.now() - t0;
  const body = await res.arrayBuffer();
  const total = performance.now() - t0;
  ttfbs.push(ttfb);
  totals.push(total);
  console.log(
    `#${String(i).padStart(2)}  ${res.status}  ttfb ${ttfb.toFixed(0)}ms  total ${total.toFixed(0)}ms  ${body.byteLength}B  region=${res.headers.get("x-vercel-id")?.split("::")[0] ?? "-"}  cache=${res.headers.get("x-vercel-cache") ?? "-"}  [${res.headers.get("server-timing") ?? "no server-timing"}]`,
  );
  if (res.status === 401) {
    console.error("401: set COOKIE env to an authenticated session cookie.");
    process.exit(1);
  }
}

console.log(`\nall   total: ${stats(totals)}`);
if (runs > 1) console.log(`warm  total: ${stats(totals.slice(1))}  (excl. run 1)`);
const warmP50 = pct(
  [...totals.slice(runs > 1 ? 1 : 0)].sort((a, b) => a - b),
  50,
);
console.log(warmP50 < 500 ? "PASS (<500ms)" : "FAIL (>=500ms)");
