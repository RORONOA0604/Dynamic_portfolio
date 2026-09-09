export declare class MemoryCache<T> {
    private readonly ttlMilliseconds;
    private cache;
    constructor(ttlMilliseconds: number);
    get(key: string): T | null;
    set(key: string, value: T): void;
    clear(): void;
}
//# sourceMappingURL=cache.d.ts.map