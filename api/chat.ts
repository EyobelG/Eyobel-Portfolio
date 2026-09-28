import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { handleChatRequest } from "./_chatHandler.js";

// Falls back to an in-memory, per-instance limiter when Redis env vars are
// absent (e.g. local dev without `vercel env pull`), so the route still works.
let ratelimit: Ratelimit | null = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "ratelimit:chat",
  });
}

const memoryHits = new Map<string, { count: number; resetAt: number }>();
function checkMemoryRateLimit(ip: string): { limited: boolean; retryAfterSec: number } {
  const WINDOW_MS = 60_000;
  const MAX_REQUESTS = 10;
  const now = Date.now();
  const entry = memoryHits.get(ip);

  if (!entry || now >= entry.resetAt) {
    memoryHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfterSec: 0 };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { limited: true, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { limited: false, retryAfterSec: 0 };
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ip = getClientIp(req);

  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(ip);
    if (!success) {
      const retryAfterSec = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({ error: `Too many requests. Please try again in ${retryAfterSec}s.` });
      return;
    }
  } else {
    const { limited, retryAfterSec } = checkMemoryRateLimit(ip);
    if (limited) {
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({ error: `Too many requests. Please try again in ${retryAfterSec}s.` });
      return;
    }
  }

  const { messages } = req.body ?? {};
  const result = await handleChatRequest(messages);
  res.status(result.status).json(result.body);
}
