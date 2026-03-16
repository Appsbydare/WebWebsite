/**
 * Simple in-memory rate limiter for API routes.
 * In production, replace with Upstash Redis for multi-instance consistency.
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

const store = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute

const LIMITS: Record<string, number> = {
    checkout: 10,
    admin_check: 30,
};

function getKey(identifier: string, route: string): string {
    return `${route}:${identifier}`;
}

export function checkRateLimit(identifier: string, route: string): { ok: boolean; remaining: number } {
    const maxRequests = LIMITS[route] ?? 10;
    const key = getKey(identifier, route);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry) {
        store.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true, remaining: maxRequests - 1 };
    }

    if (now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true, remaining: maxRequests - 1 };
    }

    entry.count += 1;
    const remaining = Math.max(0, maxRequests - entry.count);
    return {
        ok: entry.count <= maxRequests,
        remaining,
    };
}
