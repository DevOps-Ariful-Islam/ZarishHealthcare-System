import { Router } from 'express';
import { CommonTypes } from '@zarishhealthcare/shared-types';
import patientsRoutes from './patients';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const response: CommonTypes.ApiResponse<CommonTypes.HealthCheck> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      service: 'zarish-care',
      version: process.env.SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: { status: 'healthy', responseTime: 0 }, // TODO: Implement actual DB health check
        redis: { status: 'healthy', responseTime: 0 }, // TODO: Implement actual Redis health check
        memory: {
          status: process.memoryUsage().heapUsed < 1000000000 ? 'healthy' : 'warning',
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
        },
      },
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'health-check',
  };

  logger.debug('Health check performed', {
    service: 'zarish-care',
    status: response.data?.status,
    requestId: response.requestId,
  });

  res.json(response);
});

// API version info
router.get('/version', (req, res) => {
  const response: CommonTypes.ApiResponse<{
    service: string;
    version: string;
    buildDate?: string;
    gitCommit?: string;
    environment: string;
    features: string[];
  }> = {
    success: true,
    data: {
      service: 'zarish-care',
      version: process.env.SERVICE_VERSION || '1.0.0',
      buildDate: process.env.BUILD_DATE,
      gitCommit: process.env.GIT_COMMIT,
      environment: process.env.NODE_ENV || 'development',
      features: [
        'patient-management',
        'clinical-workflows',
        'ncd-programs',
        'mhpss-support',
        'maternal-health',
        'emergency-protocols',
        'offline-sync',
        'audit-logging',
      ],
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'version-check',
  };

  res.json(response);
});

// Service information
router.get('/info', (req, res) => {
  const response: CommonTypes.ApiResponse<{
    name: string;
    description: string;
    capabilities: string[];
    endpoints: string[];
    documentation: string;
  }> = {
    success: true,
    data: {
      name: 'ZarishCare Service',
      description: 'Clinical management service for humanitarian healthcare operations',
      capabilities: [
        'Patient Registration & Management',
        'Clinical Consultations',
        'NCD Program Management',
        'MHPSS Workflows',
        'Maternal Health Tracking',
        'Emergency Case Management',
        'Multi-language Support',
        'Offline-first Operations',
        'Audit Trail & Compliance',
      ],
      endpoints: [
        '/api/v1/patients',
        '/api/v1/consultations',
        '/api/v1/programs',
        '/api/v1/visits',
        '/api/v1/emergencies',
      ],
      documentation: '/api/docs',
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'info-request',
  };

  res.json(response);
});

// Mount API routes
router.use('/api/v1', patientsRoutes);

// API documentation placeholder
router.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    swagger: '/api/swagger.json',
    redoc: '/api/redoc',
    postman: '/api/postman-collection.json',
  });
});

// Root endpoint
router.get('/', (req, res) => {
  const response: CommonTypes.ApiResponse<{
    service: string;
    message: string;
    version: string;
    documentation: string;
  }> = {
    success: true,
    data: {
      service: 'ZarishCare',
      message: 'ZarishHealthcare Clinical Management Service',
      version: process.env.SERVICE_VERSION || '1.0.0',
      documentation: '/api/docs',
    },
    timestamp: new Date(),
    requestId: req.headers['x-request-id'] as string || 'root-request',
  };

  res.json(response);
});

export default router;