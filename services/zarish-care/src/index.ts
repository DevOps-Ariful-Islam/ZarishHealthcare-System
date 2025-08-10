import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { config } from './config/config';
import { Database } from './config/database';
import { Redis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { routes } from './routes';

// Load environment variables
dotenv.config();

class ZarishCareService {
  private app: express.Application;
  private database: Database;
  private redis: Redis;

  constructor() {
    this.app = express();
    this.database = new Database();
    this.redis = new Redis();
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize database connection
      await this.database.connect();
      logger.info('✅ Database connected successfully');

      // Initialize Redis connection
      await this.redis.connect();
      logger.info('✅ Redis connected successfully');

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      // Start server
      this.startServer();

    } catch (error) {
      logger.error('❌ Failed to initialize ZarishCare service:', error);
      process.exit(1);
    }
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(compression());

    // Logging
    if (config.env !== 'test') {
      this.app.use(morgan('combined', {
        stream: { write: (message: string) => logger.info(message.trim()) }
      }));
    }

    // Health check endpoint (before auth)
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'ZarishCare',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.env
      });
    });

    // Authentication middleware (for protected routes)
    this.app.use('/api', authMiddleware);
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'ZarishCare - Clinical Management Service',
        description: 'Comprehensive healthcare information system for humanitarian operations',
        version: process.env.npm_package_version || '1.0.0',
        documentation: '/api/v1/docs',
        health: '/health'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'ENDPOINT_NOT_FOUND',
          message: 'The requested endpoint was not found',
          path: req.originalUrl
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // Graceful shutdown handling
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', { reason, promise });
    });
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  private startServer(): void {
    const port = config.port;
    this.app.listen(port, () => {
      logger.info(`🚀 ZarishCare service started on port ${port}`);
      logger.info(`📱 Environment: ${config.env}`);
      logger.info(`🏥 Service ready to handle clinical management requests`);
    });
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`📴 Received ${signal}, starting graceful shutdown...`);

    try {
      // Close database connection
      await this.database.disconnect();
      logger.info('✅ Database connection closed');

      // Close Redis connection
      await this.redis.disconnect();
      logger.info('✅ Redis connection closed');

      logger.info('✨ ZarishCare service shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Initialize and start the service
const zarishCare = new ZarishCareService();
zarishCare.initialize().catch((error) => {
  logger.error('💥 Fatal error starting ZarishCare service:', error);
  process.exit(1);
});

export { ZarishCareService };