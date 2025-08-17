/**
 * Database configuration for ZarishLabs
 * Supports PostgreSQL with connection pooling and SSL for production
 */

import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'zarish_labs',
      user: process.env.DATABASE_USER || 'zarish_labs_user',
      password: process.env.DATABASE_PASSWORD || 'password',
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.TEST_DATABASE_NAME || 'zarish_labs_test',
      user: process.env.DATABASE_USER || 'zarish_labs_user',
      password: process.env.DATABASE_PASSWORD || 'password',
      ssl: false
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    acquireConnectionTimeout: 60000,
    asyncStackTraces: false
  }
};

export default config;