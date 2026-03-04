interface CacheEntry {
	geoJson: string;
	timestamp: number;
}

const MAX_CACHE_SIZE = 50;
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

class GeometryLRUCache {
	private cache = new Map<string, CacheEntry>();

	get(key: string): string | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > MAX_AGE_MS) {
			this.cache.delete(key);
			return null;
		}

		// Move to end (most recently used)
		this.cache.delete(key);
		this.cache.set(key, entry);
		return entry.geoJson;
	}

	set(key: string, geoJson: string): void {
		this.cache.delete(key);

		if (this.cache.size >= MAX_CACHE_SIZE) {
			const firstKey = this.cache.keys().next().value;
			if (firstKey !== undefined) this.cache.delete(firstKey);
		}

		this.cache.set(key, { geoJson, timestamp: Date.now() });
	}
}

export const geometryCache = new GeometryLRUCache();

// Deduplicates concurrent requests for the same geometry
const inflight = new Map<string, Promise<string | null>>();

export function deduplicatedFetch(
	key: string,
	fetcher: () => Promise<string | null>,
): Promise<string | null> {
	const cached = geometryCache.get(key);
	if (cached) return Promise.resolve(cached);

	const existing = inflight.get(key);
	if (existing) return existing;

	const promise = fetcher()
		.then((result) => {
			inflight.delete(key);
			if (result) geometryCache.set(key, result);
			return result;
		})
		.catch((err) => {
			inflight.delete(key);
			throw err;
		});

	inflight.set(key, promise);
	return promise;
}
