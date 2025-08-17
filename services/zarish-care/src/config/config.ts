import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  serviceName: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
    connectionTimeoutMillis: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origins: string[];
  };
  logging: {
    level: string;
    format: string;
  };
  security: {
    bcryptRounds: number;
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
    };
  };
  sync: {
    couchdbUrl: string;
    syncInterval: number;
    batchSize: number;
  };
  external: {
    authServiceUrl: string;
    labsServiceUrl: string;
    opsServiceUrl: string;
    analytixServiceUrl: string;
  };
  fileUpload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    storagePath: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),
  serviceName: 'zarish-care',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'zarishhealthcare',
    user: process.env.DB_USER || 'zarish',
    password: process.env.DB_PASSWORD || 'zarish123',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT || '30000', 10),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'zarish-care-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
  },

  sync: {
    couchdbUrl: process.env.COUCHDB_URL || 'http://zarish:zarish123@localhost:5984',
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '300000', 10), // 5 minutes
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100', 10),
  },

  external: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    labsServiceUrl: process.env.LABS_SERVICE_URL || 'http://localhost:3003',
    opsServiceUrl: process.env.OPS_SERVICE_URL || 'http://localhost:3004',
    analytixServiceUrl: process.env.ANALYTIX_SERVICE_URL || 'http://localhost:3005',
  },

  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    storagePath: process.env.STORAGE_PATH || './uploads',
  },
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'REDIS_HOST',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Additional validation
  if (config.database.port < 1 || config.database.port > 65535) {
    throw new Error('Invalid database port');
  }

  if (config.redis.port < 1 || config.redis.port > 65535) {
    throw new Error('Invalid Redis port');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('Invalid service port');
  }

  if (config.security.bcryptRounds < 10 || config.security.bcryptRounds > 15) {
    throw new Error('BCrypt rounds should be between 10 and 15');
  }
}

// Validate config on module load
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  process.exit(1);
}