export class MemoryCache {
    ttlMilliseconds;
    cache = new Map();
    constructor(ttlMilliseconds) {
        this.ttlMilliseconds = ttlMilliseconds;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() >= entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMilliseconds,
        });
    }
    clear() {
        this.cache.clear();
    }
}
//# sourceMappingURL=cache.js.map