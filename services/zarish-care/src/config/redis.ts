import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from './config';

export class Redis {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        connectTimeout: 10000,
        lazyConnect: true,
      },
      password: config.redis.password,
      database: config.redis.db,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
      retryDelayOnFailover: config.redis.retryDelayOnFailover,
    });

    // Event listeners
    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client connected and ready');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis client error', {
        error: error.message,
        stack: error.stack,
      });
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis client disconnected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  public async connect(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('Redis client not initialized');
      }

      await this.client.connect();
      
      // Test connection
      await this.client.ping();
      
      logger.info('Redis connection established successfully', {
        host: config.redis.host,
        port: config.redis.port,
        database: config.redis.db,
      });
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to Redis', {
        error: error instanceof Error ? error.message : error,
        host: config.redis.host,
        port: config.redis.port,
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.disconnect();
        this.isConnected = false;
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  // Generic get/set operations
  public async get(key: string): Promise<string | null> {
    this.ensureConnected();
    try {
      return await this.client!.get(key);
    } catch (error) {
      logger.error('Redis GET operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.ensureConnected();
    try {
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, value);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET operation failed', {
        key,
        ttl: ttlSeconds,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async del(key: string): Promise<number> {
    this.ensureConnected();
    try {
      return await this.client!.del(key);
    } catch (error) {
      logger.error('Redis DEL operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    this.ensureConnected();
    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    this.ensureConnected();
    try {
      const result = await this.client!.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error('Redis EXPIRE operation failed', {
        key,
        seconds,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // JSON operations for complex objects
  public async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, ttlSeconds);
  }

  public async getJSON<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Failed to parse JSON from Redis', {
        key,
        value: value.substring(0, 100),
        error: error instanceof Error ? error.message : error,
      });
      return null;
    }
  }

  // Hash operations
  public async hSet(key: string, field: string, value: string): Promise<number> {
    this.ensureConnected();
    try {
      return await this.client!.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET operation failed', {
        key,
        field,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async hGet(key: string, field: string): Promise<string | undefined> {
    this.ensureConnected();
    try {
      return await this.client!.hGet(key, field);
    } catch (error) {
      logger.error('Redis HGET operation failed', {
        key,
        field,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async hGetAll(key: string): Promise<Record<string, string>> {
    this.ensureConnected();
    try {
      return await this.client!.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // List operations
  public async lPush(key: string, ...values: string[]): Promise<number> {
    this.ensureConnected();
    try {
      return await this.client!.lPush(key, values);
    } catch (error) {
      logger.error('Redis LPUSH operation failed', {
        key,
        valueCount: values.length,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async rPop(key: string): Promise<string | null> {
    this.ensureConnected();
    try {
      return await this.client!.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async lRange(key: string, start: number, stop: number): Promise<string[]> {
    this.ensureConnected();
    try {
      return await this.client!.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE operation failed', {
        key,
        start,
        stop,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Set operations
  public async sAdd(key: string, ...members: string[]): Promise<number> {
    this.ensureConnected();
    try {
      return await this.client!.sAdd(key, members);
    } catch (error) {
      logger.error('Redis SADD operation failed', {
        key,
        memberCount: members.length,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  public async sMembers(key: string): Promise<string[]> {
    this.ensureConnected();
    try {
      return await this.client!.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS operation failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Session management
  public async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `session:${sessionId}`;
    await this.setJSON(key, sessionData, ttlSeconds);
  }

  public async getSession<T = any>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return await this.getJSON<T>(key);
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    const result = await this.del(key);
    return result > 0;
  }

  // Cache management
  public async cache<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    // Try to get from cache first
    const cached = await this.getJSON<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }

    // Cache miss, fetch data
    logger.debug('Cache miss', { key });
    const data = await fetchFn();
    
    // Store in cache
    await this.setJSON(key, data, ttlSeconds);
    
    return data;
  }

  // Rate limiting
  public async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    this.ensureConnected();
    
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    try {
      // Use a sorted set to track requests in the time window
      const pipeline = this.client!.multi();
      
      // Remove old entries
      pipeline.zRemRangeByScore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zCard(key);
      
      // Add current request
      pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      
      // Set expiry on the key
      pipeline.expire(key, windowSeconds);
      
      const results = await pipeline.exec();
      const currentCount = results[1] as number;
      
      const allowed = currentCount < limit;
      const remaining = Math.max(0, limit - currentCount - 1);
      const resetTime = now + (windowSeconds * 1000);
      
      return { allowed, remaining, resetTime };
    } catch (error) {
      logger.error('Rate limit check failed', {
        key,
        error: error instanceof Error ? error.message : error,
      });
      // On error, allow the request
      return { allowed: true, remaining: limit - 1, resetTime: now + (windowSeconds * 1000) };
    }
  }

  // Health check
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      if (!this.client || !this.isConnected) {
        return {
          healthy: false,
          details: { error: 'Redis not connected' }
        };
      }

      const start = Date.now();
      const pong = await this.client.ping();
      const responseTime = Date.now() - start;

      const info = await this.client.info('server');
      const serverInfo = this.parseRedisInfo(info);

      return {
        healthy: pong === 'PONG',
        details: {
          responseTime,
          version: serverInfo.redis_version,
          uptime: serverInfo.uptime_in_seconds,
          connectedClients: serverInfo.connected_clients,
          usedMemory: serverInfo.used_memory_human,
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : error,
        }
      };
    }
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  private ensureConnected(): void {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
  }

  // Getters
  public get connected(): boolean {
    return this.isConnected;
  }

  public get client_instance(): RedisClientType | null {
    return this.client;
  }
}

// Create and export singleton instance
export const redis = new Redis();