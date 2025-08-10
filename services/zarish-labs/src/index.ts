/**
 * ZarishLabs - Laboratory Information Management System
 * Main application entry point for humanitarian healthcare laboratory management
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';

// Import types from shared package
import {
  LabOrder,
  LabResult,
  LabTest,
  LabWorkflow,
  QualityControl,
  Equipment,
  Reagent,
  LabReagent,
  LabEquipment,
  ErrorResponse,
  SuccessResponse,
  PaginatedResponse
} from '@zarish/shared-types';

// Load environment variables
dotenv.config();

// Initialize Express application
const app: Application = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zarish-labs' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console({
      format: winston.format.simple()
    })] : [])
  ]
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Sync-Token']
}));

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'zarish-labs',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected', // This would check actual DB connection
    redis: 'connected' // This would check actual Redis connection
  };
  
  res.json(healthCheck);
});

// API Documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    service: 'ZarishLabs - Laboratory Information Management System',
    version: '1.0.0',
    description: 'Comprehensive laboratory management for humanitarian healthcare',
    features: [
      'Laboratory order management',
      'Test result processing',
      'Quality control workflows',
      'Equipment and reagent tracking',
      'Real-time result notifications',
      'Offline synchronization support',
      'Multi-laboratory coordination',
      'Regulatory compliance tracking'
    ],
    endpoints: {
      health: 'GET /health',
      orders: 'GET|POST|PUT /api/v1/orders',
      results: 'GET|POST|PUT /api/v1/results',
      tests: 'GET|POST|PUT /api/v1/tests',
      equipment: 'GET|POST|PUT /api/v1/equipment',
      reagents: 'GET|POST|PUT /api/v1/reagents',
      qc: 'GET|POST|PUT /api/v1/quality-control',
      workflows: 'GET|POST|PUT /api/v1/workflows'
    }
  });
});

// Laboratory Orders Management
app.get('/api/v1/orders', async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      priority, 
      facility_id, 
      patient_id,
      date_from, 
      date_to,
      page = 1, 
      limit = 50 
    } = req.query;

    // Mock data for demonstration - replace with actual database queries
    const mockOrders: LabOrder[] = [
      {
        id: 'order-001',
        order_number: 'LAB-2024-001234',
        patient_id: 'patient-001',
        facility_id: 'facility-cox-001',
        ordering_provider_id: 'provider-001',
        status: 'pending',
        priority: 'routine',
        ordered_date: new Date().toISOString(),
        requested_tests: ['CBC', 'RBS'],
        clinical_notes: 'Routine follow-up for diabetes management',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: PaginatedResponse<LabOrder> = {
      success: true,
      data: mockOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockOrders.length,
        totalPages: Math.ceil(mockOrders.length / Number(limit))
      }
    };

    logger.info(`Retrieved ${mockOrders.length} lab orders`, { 
      requestId: req.headers['x-request-id'],
      filters: { status, priority, facility_id }
    });

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving lab orders', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve lab orders',
      code: 'LAB_ORDERS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

app.post('/api/v1/orders', async (req: Request, res: Response) => {
  try {
    const orderData: Partial<LabOrder> = req.body;

    // Validate required fields
    if (!orderData.patient_id || !orderData.facility_id || !orderData.requested_tests?.length) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Missing required fields: patient_id, facility_id, requested_tests',
        code: 'VALIDATION_ERROR'
      };
      return res.status(400).json(errorResponse);
    }

    // Create new lab order
    const newOrder: LabOrder = {
      id: uuidv4(),
      order_number: `LAB-${new Date().getFullYear()}-${Date.now()}`,
      patient_id: orderData.patient_id,
      facility_id: orderData.facility_id,
      ordering_provider_id: orderData.ordering_provider_id || '',
      status: 'pending',
      priority: orderData.priority || 'routine',
      ordered_date: new Date().toISOString(),
      requested_tests: orderData.requested_tests,
      clinical_notes: orderData.clinical_notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };

    // Save to database (mock implementation)
    logger.info('Created new lab order', { 
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
      requestId: req.headers['x-request-id']
    });

    // Emit real-time notification
    io.emit('lab_order_created', {
      order: newOrder,
      facility_id: newOrder.facility_id
    });

    const response: SuccessResponse<LabOrder> = {
      success: true,
      data: newOrder,
      message: 'Lab order created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating lab order', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to create lab order',
      code: 'LAB_ORDER_CREATE_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Laboratory Results Management
app.get('/api/v1/results', async (req: Request, res: Response) => {
  try {
    const { 
      order_id, 
      patient_id, 
      status,
      test_type,
      date_from,
      date_to,
      page = 1, 
      limit = 50 
    } = req.query;

    // Mock results data
    const mockResults: LabResult[] = [
      {
        id: 'result-001',
        order_id: 'order-001',
        test_id: 'test-cbc-001',
        patient_id: 'patient-001',
        status: 'completed',
        result_data: {
          'Hemoglobin': { value: '12.5', unit: 'g/dL', reference_range: '12.0-15.5', status: 'normal' },
          'WBC Count': { value: '7200', unit: '/μL', reference_range: '4000-11000', status: 'normal' },
          'Platelet Count': { value: '250000', unit: '/μL', reference_range: '150000-450000', status: 'normal' }
        },
        performed_by: 'tech-001',
        performed_date: new Date().toISOString(),
        verified_by: 'pathologist-001',
        verified_date: new Date().toISOString(),
        critical_values: [],
        notes: 'Normal complete blood count',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: PaginatedResponse<LabResult> = {
      success: true,
      data: mockResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockResults.length,
        totalPages: Math.ceil(mockResults.length / Number(limit))
      }
    };

    logger.info(`Retrieved ${mockResults.length} lab results`, { 
      requestId: req.headers['x-request-id'],
      filters: { order_id, patient_id, status }
    });

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving lab results', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve lab results',
      code: 'LAB_RESULTS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

app.post('/api/v1/results', async (req: Request, res: Response) => {
  try {
    const resultData: Partial<LabResult> = req.body;

    // Validate required fields
    if (!resultData.order_id || !resultData.test_id || !resultData.result_data) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Missing required fields: order_id, test_id, result_data',
        code: 'VALIDATION_ERROR'
      };
      return res.status(400).json(errorResponse);
    }

    const newResult: LabResult = {
      id: uuidv4(),
      order_id: resultData.order_id,
      test_id: resultData.test_id,
      patient_id: resultData.patient_id || '',
      status: 'pending_verification',
      result_data: resultData.result_data,
      performed_by: resultData.performed_by || '',
      performed_date: new Date().toISOString(),
      critical_values: resultData.critical_values || [],
      notes: resultData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };

    logger.info('Created new lab result', { 
      resultId: newResult.id,
      orderId: newResult.order_id,
      requestId: req.headers['x-request-id']
    });

    // Check for critical values and notify immediately
    if (newResult.critical_values && newResult.critical_values.length > 0) {
      io.emit('critical_result_alert', {
        result: newResult,
        criticalValues: newResult.critical_values
      });
    }

    // Emit general result notification
    io.emit('lab_result_available', {
      result: newResult,
      patient_id: newResult.patient_id
    });

    const response: SuccessResponse<LabResult> = {
      success: true,
      data: newResult,
      message: 'Lab result created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating lab result', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to create lab result',
      code: 'LAB_RESULT_CREATE_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Quality Control Management
app.get('/api/v1/quality-control', async (req: Request, res: Response) => {
  try {
    const { test_type, date_from, date_to, status } = req.query;

    const mockQcData: QualityControl[] = [
      {
        id: 'qc-001',
        test_type: 'CBC',
        control_level: 'normal',
        expected_values: {
          'Hemoglobin': { value: '13.0', unit: 'g/dL', tolerance: '±0.5' },
          'WBC Count': { value: '6500', unit: '/μL', tolerance: '±500' }
        },
        measured_values: {
          'Hemoglobin': { value: '13.1', unit: 'g/dL' },
          'WBC Count': { value: '6450', unit: '/μL' }
        },
        status: 'passed',
        performed_date: new Date().toISOString(),
        performed_by: 'tech-001',
        equipment_id: 'hematology-analyzer-001',
        lot_number: 'QC-LOT-2024-001',
        created_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: SuccessResponse<QualityControl[]> = {
      success: true,
      data: mockQcData,
      message: 'Quality control data retrieved successfully'
    };

    logger.info(`Retrieved ${mockQcData.length} QC records`, { 
      requestId: req.headers['x-request-id'],
      filters: { test_type, status }
    });

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving QC data', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve quality control data',
      code: 'QC_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Equipment Management
app.get('/api/v1/equipment', async (req: Request, res: Response) => {
  try {
    const { facility_id, status, type } = req.query;

    const mockEquipment: LabEquipment[] = [
      {
        id: 'equip-001',
        name: 'Hematology Analyzer Model XYZ',
        type: 'hematology_analyzer',
        manufacturer: 'MedTech Solutions',
        model: 'HEM-2024-Pro',
        serial_number: 'HEM001234567',
        facility_id: 'facility-cox-001',
        status: 'operational',
        last_calibration: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_maintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        specifications: {
          throughput: '120 tests/hour',
          sample_volume: '20μL',
          parameters: ['CBC', 'Differential', 'Reticulocytes']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: SuccessResponse<LabEquipment[]> = {
      success: true,
      data: mockEquipment,
      message: 'Equipment data retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving equipment data', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve equipment data',
      code: 'EQUIPMENT_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Reagent Inventory Management
app.get('/api/v1/reagents', async (req: Request, res: Response) => {
  try {
    const { facility_id, expiry_alert, low_stock } = req.query;

    const mockReagents: LabReagent[] = [
      {
        id: 'reagent-001',
        name: 'CBC Reagent Kit',
        type: 'hematology',
        manufacturer: 'LabSupply Inc.',
        catalog_number: 'CBC-KIT-2024',
        lot_number: 'LOT2024001',
        facility_id: 'facility-cox-001',
        current_stock: 45,
        minimum_stock: 10,
        unit: 'tests',
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        storage_conditions: 'Store at 2-8°C, protect from light',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: SuccessResponse<LabReagent[]> = {
      success: true,
      data: mockReagents,
      message: 'Reagent inventory retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving reagent inventory', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve reagent inventory',
      code: 'REAGENT_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// WebSocket connection handling for real-time updates
io.on('connection', (socket) => {
  logger.info('New WebSocket connection established', { socketId: socket.id });

  socket.on('join_facility', (facilityId: string) => {
    socket.join(`facility_${facilityId}`);
    logger.info('Socket joined facility room', { socketId: socket.id, facilityId });
  });

  socket.on('join_lab', (labId: string) => {
    socket.join(`lab_${labId}`);
    logger.info('Socket joined lab room', { socketId: socket.id, labId });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket connection disconnected', { socketId: socket.id });
  });
});

// Automated scheduled tasks
cron.schedule('0 8 * * *', () => {
  logger.info('Running daily reagent expiry check');
  // Implementation for checking reagent expiry and sending alerts
  checkReagentExpiry();
});

cron.schedule('0 6 * * 1', () => {
  logger.info('Running weekly equipment maintenance reminder');
  // Implementation for equipment maintenance reminders
  checkEquipmentMaintenance();
});

async function checkReagentExpiry() {
  try {
    // Mock implementation - replace with actual database queries
    const expiringReagents = []; // Query reagents expiring in next 30 days
    
    if (expiringReagents.length > 0) {
      io.emit('reagent_expiry_alert', {
        reagents: expiringReagents,
        alertType: 'expiry_warning'
      });
    }
  } catch (error) {
    logger.error('Error checking reagent expiry', { error });
  }
}

async function checkEquipmentMaintenance() {
  try {
    // Mock implementation - replace with actual database queries
    const maintenanceDue = []; // Query equipment due for maintenance
    
    if (maintenanceDue.length > 0) {
      io.emit('equipment_maintenance_alert', {
        equipment: maintenanceDue,
        alertType: 'maintenance_due'
      });
    }
  } catch (error) {
    logger.error('Error checking equipment maintenance', { error });
  }
}

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled application error', {
    error: error.message,
    stack: error.stack,
    requestId: req.headers['x-request-id'],
    url: req.url,
    method: req.method
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    code: 'INTERNAL_SERVER_ERROR'
  };

  res.status(500).json(errorResponse);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  };
  res.status(404).json(errorResponse);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  logger.info(`ZarishLabs service running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default app;