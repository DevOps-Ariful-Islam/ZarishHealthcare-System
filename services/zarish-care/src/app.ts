import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { config } from './config/config';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { initializeAuth } from './middleware/auth';
import { errorHandler, notFoundHandler, timeoutHandler, unhandledErrorHandler } from './middleware/errorHandler';
import routes from './routes/index';

export class ZarishCareApp {
  private app: Application;
  private server: any;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));

    // CORS configuration for humanitarian operations
    this.app.use(cors({
      origin: config.cors.allowedOrigins,
      credentials: config.cors.allowCredentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Request-ID',
        'X-Organization-ID',
        'X-Project-ID',
        'X-Device-ID',
        'X-Sync-Version',
      ],
      exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Total-Count',
        'X-Page-Count',
      ],
    }));

    // Compression for bandwidth-constrained humanitarian environments
    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    }));

    // Request parsing
    this.app.use(express.json({
      limit: config.server.maxRequestSize,
      verify: (req, res, buf, encoding) => {
        // Store raw body for webhook verification if needed
        if (req.url?.includes('/webhook')) {
          (req as any).rawBody = buf;
        }
      },
    }));

    this.app.use(express.urlencoded({
      extended: true,
      limit: config.server.maxRequestSize,
    }));

    // Request timeout
    this.app.use(timeoutHandler(config.server.requestTimeout));

    // Request ID generation for tracing
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
      next();
    });

    // Logging with structured format for humanitarian operations
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => {
          logger.info('HTTP Request', {
            type: 'http_access',
            message: message.trim(),
          });
        },
      },
      skip: (req) => {
        // Skip health checks and metrics endpoints
        return req.url === '/health' || req.url === '/metrics';
      },
    }));

    // Rate limiting for humanitarian field environments
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
        timestamp: new Date(),
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
        });
        
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
          },
          timestamp: new Date(),
          requestId: req.headers['x-request-id'],
        });
      },
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.url === '/health';
      },
    });

    this.app.use(limiter);

    // Device and sync headers validation for offline-first operations
    this.app.use((req, res, next) => {
      const deviceId = req.headers['x-device-id'] as string;
      const syncVersion = req.headers['x-sync-version'] as string;
      
      // Log device information for humanitarian field tracking
      if (deviceId || syncVersion) {
        logger.debug('Device sync headers', {
          deviceId,
          syncVersion,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
      
      next();
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/', routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    // Unhandled errors
    unhandledErrorHandler();
  }

  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing ZarishCare service...', {
        service: 'zarish-care',
        environment: config.env,
        version: config.version,
      });

      // Initialize database
      logger.info('Connecting to database...');
      await initializeDatabase();
      logger.info('Database connection established');

      // Initialize Redis
      if (config.redis.enabled) {
        logger.info('Connecting to Redis...');
        const redisClient = await initializeRedis();
        logger.info('Redis connection established');

        // Initialize authentication with Redis
        initializeAuth(config.auth.jwtSecret, redisClient);
      } else {
        // Initialize authentication without Redis
        initializeAuth(config.auth.jwtSecret);
      }

      logger.info('ZarishCare service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ZarishCare service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initialize();

      this.server = this.app.listen(config.server.port, config.server.host, () => {
        logger.info('ZarishCare service started', {
          service: 'zarish-care',
          version: config.version,
          environment: config.env,
          host: config.server.host,
          port: config.server.port,
          processId: process.pid,
        });
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start ZarishCare service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        logger.info('Stopping ZarishCare service...');
        
        this.server.close((err?: Error) => {
          if (err) {
            logger.error('Error stopping server', {
              error: err.message,
              stack: err.stack,
            });
          } else {
            logger.info('ZarishCare service stopped');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, initiating graceful shutdown...`);
      
      try {
        await this.stop();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled promise rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
      process.exit(1);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default ZarishCareApp;