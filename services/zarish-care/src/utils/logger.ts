import winston from 'winston';
import { config } from '../config/config';

// Custom format for console logging in development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, stack, service, ...meta }) => {
    let log = `${timestamp} [${service || 'ZarishCare'}] ${level}: ${message}`;
    
    if (Object.keys(meta).length) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// JSON format for production logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
);

// Create transports based on environment
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.env === 'production' ? jsonFormat : consoleFormat,
    level: config.logging.level,
  }),
];

// Add file transports for production
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: { service: 'zarish-care' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: jsonFormat,
    }),
  ],
  exitOnError: false,
});

// Stream for Morgan HTTP request logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim(), { component: 'http' });
  },
};

// Helper methods for structured logging
export const loggers = {
  // Patient-related logging
  patient: {
    created: (patientId: string, userId?: string, meta?: any) => {
      logger.info('Patient created', {
        action: 'patient_created',
        patientId,
        userId,
        ...meta,
      });
    },
    updated: (patientId: string, userId?: string, changes?: any) => {
      logger.info('Patient updated', {
        action: 'patient_updated',
        patientId,
        userId,
        changes,
      });
    },
    deleted: (patientId: string, userId?: string) => {
      logger.warn('Patient deleted', {
        action: 'patient_deleted',
        patientId,
        userId,
      });
    },
    accessed: (patientId: string, userId?: string, accessType?: string) => {
      logger.info('Patient accessed', {
        action: 'patient_accessed',
        patientId,
        userId,
        accessType,
      });
    },
  },

  // Clinical-related logging
  clinical: {
    consultationCreated: (consultationId: string, patientId: string, providerId?: string) => {
      logger.info('Consultation created', {
        action: 'consultation_created',
        consultationId,
        patientId,
        providerId,
      });
    },
    diagnosisAdded: (consultationId: string, diagnosis: string, providerId?: string) => {
      logger.info('Diagnosis added', {
        action: 'diagnosis_added',
        consultationId,
        diagnosis,
        providerId,
      });
    },
    vitalsRecorded: (consultationId: string, vitals: any, providerId?: string) => {
      logger.info('Vital signs recorded', {
        action: 'vitals_recorded',
        consultationId,
        vitals,
        providerId,
      });
    },
  },

  // Sync-related logging
  sync: {
    started: (syncType: string, deviceId?: string) => {
      logger.info('Sync started', {
        action: 'sync_started',
        syncType,
        deviceId,
      });
    },
    completed: (syncType: string, recordCount: number, deviceId?: string) => {
      logger.info('Sync completed', {
        action: 'sync_completed',
        syncType,
        recordCount,
        deviceId,
      });
    },
    failed: (syncType: string, error: any, deviceId?: string) => {
      logger.error('Sync failed', {
        action: 'sync_failed',
        syncType,
        error: error.message || error,
        stack: error.stack,
        deviceId,
      });
    },
    conflict: (recordId: string, conflictType: string, deviceId?: string) => {
      logger.warn('Sync conflict detected', {
        action: 'sync_conflict',
        recordId,
        conflictType,
        deviceId,
      });
    },
  },

  // Security-related logging
  security: {
    authAttempt: (userId?: string, success: boolean = false, ip?: string, userAgent?: string) => {
      logger.info('Authentication attempt', {
        action: 'auth_attempt',
        userId,
        success,
        ip,
        userAgent,
      });
    },
    unauthorizedAccess: (resource: string, userId?: string, ip?: string) => {
      logger.warn('Unauthorized access attempt', {
        action: 'unauthorized_access',
        resource,
        userId,
        ip,
      });
    },
    suspiciousActivity: (activity: string, userId?: string, ip?: string, details?: any) => {
      logger.warn('Suspicious activity detected', {
        action: 'suspicious_activity',
        activity,
        userId,
        ip,
        details,
      });
    },
  },

  // API-related logging
  api: {
    request: (method: string, url: string, userId?: string, duration?: number) => {
      logger.info('API request', {
        action: 'api_request',
        method,
        url,
        userId,
        duration,
      });
    },
    error: (method: string, url: string, statusCode: number, error: any, userId?: string) => {
      logger.error('API error', {
        action: 'api_error',
        method,
        url,
        statusCode,
        error: error.message || error,
        stack: error.stack,
        userId,
      });
    },
    rateLimit: (ip: string, userId?: string) => {
      logger.warn('Rate limit exceeded', {
        action: 'rate_limit_exceeded',
        ip,
        userId,
      });
    },
  },

  // Database-related logging
  database: {
    connected: (database: string) => {
      logger.info('Database connected', {
        action: 'database_connected',
        database,
      });
    },
    disconnected: (database: string) => {
      logger.info('Database disconnected', {
        action: 'database_disconnected',
        database,
      });
    },
    error: (operation: string, error: any, query?: string) => {
      logger.error('Database error', {
        action: 'database_error',
        operation,
        error: error.message || error,
        stack: error.stack,
        query,
      });
    },
    slowQuery: (query: string, duration: number, threshold: number = 1000) => {
      if (duration > threshold) {
        logger.warn('Slow query detected', {
          action: 'slow_query',
          query,
          duration,
          threshold,
        });
      }
    },
  },

  // System-related logging
  system: {
    startup: (version?: string) => {
      logger.info('Service starting up', {
        action: 'service_startup',
        version,
        environment: config.env,
        nodeVersion: process.version,
      });
    },
    shutdown: (signal?: string) => {
      logger.info('Service shutting down', {
        action: 'service_shutdown',
        signal,
      });
    },
    healthCheck: (status: string, checks?: any) => {
      logger.info('Health check', {
        action: 'health_check',
        status,
        checks,
      });
    },
    performance: (metric: string, value: number, unit: string = 'ms') => {
      logger.info('Performance metric', {
        action: 'performance_metric',
        metric,
        value,
        unit,
      });
    },
  },
};

// Helper function to create child logger with additional context
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Helper function to set log level dynamically
export const setLogLevel = (level: string) => {
  logger.level = level;
  logger.transports.forEach((transport) => {
    transport.level = level;
  });
  logger.info(`Log level changed to: ${level}`);
};

// Performance monitoring helper
export class PerformanceLogger {
  private startTime: [number, number];
  private context: Record<string, any>;

  constructor(operation: string, context: Record<string, any> = {}) {
    this.startTime = process.hrtime();
    this.context = { operation, ...context };
  }

  public end(additionalContext: Record<string, any> = {}) {
    const [seconds, nanoseconds] = process.hrtime(this.startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.info('Operation completed', {
      ...this.context,
      ...additionalContext,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      unit: 'ms',
    });

    return duration;
  }
}

// Export default logger for backward compatibility
export default logger;