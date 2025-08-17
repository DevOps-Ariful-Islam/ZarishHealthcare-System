import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../utils/logger';
import { config } from './config';

export class Database {
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: config.database.maxConnections,
      connectionTimeoutMillis: config.database.connectionTimeoutMillis,
      idleTimeoutMillis: 30000,
      allowExitOnIdle: true,
    });

    // Pool event listeners
    this.pool.on('connect', (client) => {
      logger.info('New database client connected', {
        totalCount: this.pool?.totalCount,
        idleCount: this.pool?.idleCount,
      });
    });

    this.pool.on('acquire', (client) => {
      logger.debug('Client acquired from pool', {
        totalCount: this.pool?.totalCount,
        idleCount: this.pool?.idleCount,
      });
    });

    this.pool.on('remove', (client) => {
      logger.info('Client removed from pool', {
        totalCount: this.pool?.totalCount,
        idleCount: this.pool?.idleCount,
      });
    });

    this.pool.on('error', (err, client) => {
      logger.error('Unexpected error on idle client', {
        error: err.message,
        stack: err.stack,
      });
    });
  }

  public async connect(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      logger.info('Database connection established successfully', {
        host: config.database.host,
        database: config.database.name,
        maxConnections: config.database.maxConnections,
      });

      // Initialize database schema if needed
      await this.initializeSchema();

    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        host: config.database.host,
        database: config.database.name,
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database connection closed');
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool || !this.isConnected) {
      throw new Error('Database not connected');
    }

    const start = Date.now();
    
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Database query executed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration,
        rowCount: result.rowCount,
      });

      // Log slow queries
      if (duration > 1000) {
        logger.warn('Slow query detected', {
          query: text,
          duration,
          params: params ? params.length : 0,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Database query failed', {
        query: text,
        params,
        duration,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.pool || !this.isConnected) {
      throw new Error('Database not connected');
    }
    return await this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      if (!this.pool || !this.isConnected) {
        return {
          healthy: false,
          details: { error: 'Database not connected' }
        };
      }

      const start = Date.now();
      const result = await this.pool.query('SELECT NOW() as current_time, version()');
      const responseTime = Date.now() - start;

      return {
        healthy: true,
        details: {
          responseTime,
          serverVersion: result.rows[0]?.version,
          currentTime: result.rows[0]?.current_time,
          totalConnections: this.pool.totalCount,
          idleConnections: this.pool.idleCount,
          waitingCount: this.pool.waitingCount,
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

  private async initializeSchema(): Promise<void> {
    try {
      // Create extensions if they don't exist
      await this.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      await this.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      
      logger.info('Database schema initialization completed');
    } catch (error) {
      logger.error('Failed to initialize database schema', {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Helper methods for common operations
  public async exists(table: string, conditions: Record<string, any>): Promise<boolean> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause})`;
    const result = await this.query(query, values);
    
    return result.rows[0]?.exists || false;
  }

  public async count(table: string, conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${table}`;
    let values: any[] = [];
    
    if (conditions) {
      const keys = Object.keys(conditions);
      values = Object.values(conditions);
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    const result = await this.query(query, values);
    return parseInt(result.rows[0]?.count || '0');
  }

  public async findById<T = any>(table: string, id: string, idColumn: string = 'id'): Promise<T | null> {
    const query = `SELECT * FROM ${table} WHERE ${idColumn} = $1 AND deleted = FALSE`;
    const result = await this.query<T>(query, [id]);
    return result.rows[0] || null;
  }

  public async findMany<T = any>(
    table: string,
    conditions?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    }
  ): Promise<T[]> {
    let query = `SELECT * FROM ${table}`;
    let values: any[] = [];
    
    // Add base condition for soft delete
    const baseConditions = { deleted: false, ...conditions };
    
    if (baseConditions) {
      const keys = Object.keys(baseConditions);
      values = Object.values(baseConditions);
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    if (options?.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }
    
    if (options?.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    if (options?.offset) {
      query += ` OFFSET ${options.offset}`;
    }
    
    const result = await this.query<T>(query, values);
    return result.rows;
  }

  // Getter for connection status
  public get connected(): boolean {
    return this.isConnected;
  }

  // Getter for pool stats
  public get stats() {
    return {
      totalCount: this.pool?.totalCount || 0,
      idleCount: this.pool?.idleCount || 0,
      waitingCount: this.pool?.waitingCount || 0,
      connected: this.isConnected,
    };
  }
}

// Create and export singleton instance
export const database = new Database();

// Export types for use in other modules
export type { PoolClient, QueryResult } from 'pg';