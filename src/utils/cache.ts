// ─── Simple in-memory cache for balance & tx history ─────────────────────────
interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, value: T, ttlMs = 30_000): void {
    cache.set(key, { value, timestamp: Date.now(), ttl: ttlMs });
}

export function getCache<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

export function clearCache(key?: string): void {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}
