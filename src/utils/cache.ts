import { LRUCache } from "lru-cache";
import { logger } from "@elizaos/core";

/**
 * Simple caching service using LRU cache
 */
export class CacheService {
  private cache: LRUCache<string, any>;
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
    this.cache = new LRUCache({
      max: 1000, // Maximum number of items
      ttl: this.ttl,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    logger.debug(
      `[AIGateway] Cache initialized with TTL: ${ttlSeconds}s, max items: 1000`,
    );
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(params: any): string {
    // Create a stable key from the parameters (order-insensitive)
    const key = JSON.stringify(params, Object.keys(params).sort());
    return Buffer.from(key).toString("base64").substring(0, 50);
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      logger.debug(`[AIGateway] Cache hit for key: ${key.substring(0, 20)}...`);
    }
    return value as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.ttl;
    this.cache.set(key, value, { ttl });
    logger.debug(
      `[AIGateway] Cache set for key: ${key.substring(0, 20)}... (TTL: ${ttl / 1000}s)`,
    );
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug(
        `[AIGateway] Cache deleted for key: ${key.substring(0, 20)}...`,
      );
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    logger.debug("[AIGateway] Cache cleared");
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      ttl: this.ttl / 1000,
      calculatedSize: this.cache.calculatedSize,
    };
  }

  /**
   * Log cache statistics
   */
  logStats(): void {
    const stats = this.getStats();
    logger.info(
      `[AIGateway] Cache stats: ${stats.size}/${stats.max} items, TTL: ${stats.ttl}s`,
    );
  }
}
