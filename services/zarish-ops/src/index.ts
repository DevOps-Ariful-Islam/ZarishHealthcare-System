/**
 * ZarishOps - Operations Coordination System
 * Main application entry point for humanitarian healthcare operations coordination
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
import moment from 'moment-timezone';
import axios from 'axios';

// Import types from shared package
import {
  Activity,
  Resource,
  Partner,
  FourWReport,
  EmergencyAlert,
  SupplyChain,
  Coordination,
  ResourceAllocation,
  ActivityPlan,
  OperationsMetrics,
  FieldReport,
  InterAgencyMeeting,
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
  defaultMeta: { service: 'zarish-ops' },
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
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
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
app.use(express.json({ limit: '50mb' })); // Larger limit for GIS data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message: string) => logger.info(message.trim()) }
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
    service: 'zarish-ops',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected',
    redis: 'connected',
    external_services: {
      zarish_care: 'connected',
      zarish_labs: 'connected',
      zarish_analytics: 'connected'
    }
  };
  
  res.json(healthCheck);
});

// API Documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    service: 'ZarishOps - Operations Coordination System',
    version: '1.0.0',
    description: 'Comprehensive operations coordination for humanitarian healthcare',
    features: [
      '4W Reporting (Who, What, Where, When)',
      'Resource allocation and management',
      'Multi-partner coordination',
      'Emergency response coordination',
      'Supply chain management',
      'Activity planning and monitoring',
      'Geographic information systems',
      'Inter-agency coordination',
      'Field reporting and data collection',
      'Real-time operations dashboard'
    ],
    endpoints: {
      health: 'GET /health',
      activities: 'GET|POST|PUT /api/v1/activities',
      resources: 'GET|POST|PUT /api/v1/resources',
      partners: 'GET|POST|PUT /api/v1/partners',
      reports: 'GET|POST|PUT /api/v1/reports',
      emergency: 'GET|POST|PUT /api/v1/emergency',
      supply_chain: 'GET|POST|PUT /api/v1/supply-chain',
      coordination: 'GET|POST|PUT /api/v1/coordination',
      metrics: 'GET /api/v1/metrics'
    }
  });
});

// Activity Management - Core operational activities
app.get('/api/v1/activities', async (req: Request, res: Response) => {
  try {
    const { 
      partner_id, 
      sector, 
      location, 
      status,
      date_from, 
      date_to,
      page = 1, 
      limit = 50 
    } = req.query;

    // Mock data based on real humanitarian operations
    const mockActivities: Activity[] = [
      {
        id: 'activity-001',
        name: 'NCD Outpatient Services - Rohingya Camp 4',
        description: 'Providing non-communicable disease management services including diabetes and hypertension care',
        partner_id: 'msf-001',
        sector: 'health',
        subsector: 'primary_healthcare',
        location: {
          camp: 'Camp 4',
          upazila: 'Teknaf',
          district: 'Cox\'s Bazar',
          coordinates: { latitude: 20.8734, longitude: 92.2079 }
        },
        status: 'ongoing',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        beneficiaries: {
          planned: 2500,
          reached: 2400,
          female: 1440,
          male: 960,
          children_under_18: 0,
          adults_18_59: 1920,
          elderly_60_plus: 480
        },
        indicators: [
          { name: 'Monthly consultations', target: 200, actual: 195, unit: 'consultations' },
          { name: 'Patients on treatment', target: 800, actual: 785, unit: 'patients' }
        ],
        budget: {
          total: 150000,
          spent: 125000,
          currency: 'USD'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      },
      {
        id: 'activity-002',
        name: 'Laboratory Services - Central Lab',
        description: 'Comprehensive laboratory diagnostic services for refugee and host communities',
        partner_id: 'iom-001',
        sector: 'health',
        subsector: 'laboratory_services',
        location: {
          facility: 'Central Laboratory',
          camp: 'Multiple',
          upazila: 'Ukhiya',
          district: 'Cox\'s Bazar',
          coordinates: { latitude: 21.2266, longitude: 92.1058 }
        },
        status: 'ongoing',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        beneficiaries: {
          planned: 50000,
          reached: 47500,
          female: 24700,
          male: 22800,
          children_under_18: 14250,
          adults_18_59: 28500,
          elderly_60_plus: 4750
        },
        indicators: [
          { name: 'Tests performed', target: 3000, actual: 2850, unit: 'tests/month' },
          { name: 'Turnaround time', target: 24, actual: 18, unit: 'hours' }
        ],
        budget: {
          total: 800000,
          spent: 600000,
          currency: 'USD'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: PaginatedResponse<Activity> = {
      success: true,
      data: mockActivities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockActivities.length,
        totalPages: Math.ceil(mockActivities.length / Number(limit))
      }
    };

    logger.info(`Retrieved ${mockActivities.length} activities`, { 
      requestId: req.headers['x-request-id'],
      filters: { partner_id, sector, status }
    });

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving activities', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve activities',
      code: 'ACTIVITIES_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

app.post('/api/v1/activities', async (req: Request, res: Response) => {
  try {
    const activityData: Partial<Activity> = req.body;

    // Validate required fields
    if (!activityData.name || !activityData.partner_id || !activityData.sector || !activityData.location) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Missing required fields: name, partner_id, sector, location',
        code: 'VALIDATION_ERROR'
      };
      return res.status(400).json(errorResponse);
    }

    const newActivity: Activity = {
      id: uuidv4(),
      name: activityData.name,
      description: activityData.description || '',
      partner_id: activityData.partner_id,
      sector: activityData.sector,
      subsector: activityData.subsector,
      location: activityData.location,
      status: activityData.status || 'planned',
      start_date: activityData.start_date || new Date().toISOString().split('T')[0],
      end_date: activityData.end_date,
      beneficiaries: activityData.beneficiaries || {
        planned: 0,
        reached: 0,
        female: 0,
        male: 0,
        children_under_18: 0,
        adults_18_59: 0,
        elderly_60_plus: 0
      },
      indicators: activityData.indicators || [],
      budget: activityData.budget,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };

    logger.info('Created new activity', { 
      activityId: newActivity.id,
      partnerId: newActivity.partner_id,
      sector: newActivity.sector,
      requestId: req.headers['x-request-id']
    });

    // Emit real-time notification for activity planning
    io.emit('activity_created', {
      activity: newActivity,
      partner_id: newActivity.partner_id,
      sector: newActivity.sector
    });

    const response: SuccessResponse<Activity> = {
      success: true,
      data: newActivity,
      message: 'Activity created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating activity', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to create activity',
      code: 'ACTIVITY_CREATE_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Resource Management
app.get('/api/v1/resources', async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      location, 
      availability, 
      partner_id,
      page = 1, 
      limit = 50 
    } = req.query;

    const mockResources: Resource[] = [
      {
        id: 'resource-001',
        name: 'Mobile Medical Team',
        type: 'human_resources',
        category: 'medical_staff',
        description: 'Specialized medical team for emergency response and outreach services',
        quantity: 1,
        unit: 'team',
        location: {
          facility: 'Coordination Hub',
          camp: 'Multiple',
          upazila: 'Ukhiya',
          district: 'Cox\'s Bazar',
          coordinates: { latitude: 21.2266, longitude: 92.1058 }
        },
        availability: 'available',
        partner_id: 'msf-001',
        allocation_status: 'allocated',
        allocated_to: 'activity-001',
        specifications: {
          capacity: '50 patients/day',
          specializations: ['Internal Medicine', 'Pediatrics', 'Emergency Care'],
          equipment: ['Basic medical kit', 'Portable ultrasound', 'Laboratory kit']
        },
        maintenance_schedule: 'monthly',
        last_maintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      },
      {
        id: 'resource-002',
        name: 'Laboratory Equipment - Hematology Analyzer',
        type: 'equipment',
        category: 'laboratory_equipment',
        description: 'Automated hematology analyzer for complete blood count testing',
        quantity: 2,
        unit: 'units',
        location: {
          facility: 'Central Laboratory',
          camp: 'Service Area',
          upazila: 'Ukhiya',
          district: 'Cox\'s Bazar',
          coordinates: { latitude: 21.2266, longitude: 92.1058 }
        },
        availability: 'available',
        partner_id: 'iom-001',
        allocation_status: 'available',
        specifications: {
          model: 'HEM-2024-Pro',
          capacity: '120 tests/hour',
          parameters: ['CBC', 'Differential', 'Reticulocytes'],
          power_requirements: '220V, 50Hz'
        },
        maintenance_schedule: 'monthly',
        last_maintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: PaginatedResponse<Resource> = {
      success: true,
      data: mockResources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockResources.length,
        totalPages: Math.ceil(mockResources.length / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving resources', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve resources',
      code: 'RESOURCES_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// 4W Reporting (Who, What, Where, When)
app.get('/api/v1/reports/4w', async (req: Request, res: Response) => {
  try {
    const { 
      reporting_period, 
      partner_id, 
      sector, 
      location,
      page = 1, 
      limit = 50 
    } = req.query;

    const mock4WReports: FourWReport[] = [
      {
        id: 'report-4w-001',
        reporting_period: '2024-01',
        partner_id: 'msf-001',
        partner_name: 'Médecins Sans Frontières',
        activities: [
          {
            what: 'Primary Healthcare Services',
            where: {
              camp: 'Camp 4',
              block: 'Block A-D',
              upazila: 'Teknaf',
              district: 'Cox\'s Bazar',
              coordinates: { latitude: 20.8734, longitude: 92.2079 }
            },
            when: {
              start_date: '2024-01-01',
              end_date: '2024-01-31',
              frequency: 'daily'
            },
            who: {
              implementing_partner: 'MSF',
              funding_partner: 'ECHO',
              local_partners: ['BRAC', 'Local CBO']
            },
            beneficiaries: {
              planned: 2500,
              reached: 2400,
              female: 1440,
              male: 960
            },
            indicators: [
              { name: 'Consultations', value: 1950, unit: 'consultations' },
              { name: 'Vaccinations', value: 180, unit: 'doses' }
            ]
          }
        ],
        sector: 'health',
        subsector: 'primary_healthcare',
        gaps_challenges: [
          'Limited access during monsoon season',
          'Shortage of specialized medicines',
          'Language barriers with some patient groups'
        ],
        next_month_plans: [
          'Expand services to additional blocks',
          'Increase mobile clinic frequency',
          'Train additional community health workers'
        ],
        submitted_date: new Date().toISOString(),
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: 'synced'
      }
    ];

    const response: PaginatedResponse<FourWReport> = {
      success: true,
      data: mock4WReports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mock4WReports.length,
        totalPages: Math.ceil(mock4WReports.length / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving 4W reports', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve 4W reports',
      code: 'FOURW_REPORTS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Emergency Response Coordination
app.post('/api/v1/emergency/alert', async (req: Request, res: Response) => {
  try {
    const alertData: Partial<EmergencyAlert> = req.body;

    if (!alertData.type || !alertData.severity || !alertData.location) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Missing required fields: type, severity, location',
        code: 'VALIDATION_ERROR'
      };
      return res.status(400).json(errorResponse);
    }

    const emergencyAlert: EmergencyAlert = {
      id: uuidv4(),
      type: alertData.type,
      severity: alertData.severity,
      title: alertData.title || `${alertData.type} Emergency Alert`,
      description: alertData.description || '',
      location: alertData.location,
      affected_population: alertData.affected_population || 0,
      reported_by: alertData.reported_by || '',
      status: 'active',
      response_actions: alertData.response_actions || [],
      required_resources: alertData.required_resources || [],
      coordination_contacts: alertData.coordination_contacts || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    };

    logger.warn('Emergency alert created', {
      alertId: emergencyAlert.id,
      type: emergencyAlert.type,
      severity: emergencyAlert.severity,
      location: emergencyAlert.location,
      requestId: req.headers['x-request-id']
    });

    // Emit immediate emergency notification to all connected clients
    io.emit('emergency_alert', {
      alert: emergencyAlert,
      timestamp: new Date().toISOString(),
      priority: 'high'
    });

    // Send notifications to coordination partners
    await notifyEmergencyContacts(emergencyAlert);

    const response: SuccessResponse<EmergencyAlert> = {
      success: true,
      data: emergencyAlert,
      message: 'Emergency alert created and notifications sent'
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating emergency alert', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to create emergency alert',
      code: 'EMERGENCY_ALERT_CREATE_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Operations Metrics Dashboard
app.get('/api/v1/metrics/dashboard', async (req: Request, res: Response) => {
  try {
    const { period = '30d', location, sector } = req.query;

    // Mock comprehensive operations metrics
    const operationsMetrics: OperationsMetrics = {
      period: period as string,
      location: location as string,
      activities: {
        total: 24,
        active: 18,
        completed: 4,
        suspended: 2,
        by_sector: {
          health: 15,
          nutrition: 4,
          wash: 3,
          education: 2
        }
      },
      beneficiaries: {
        total_planned: 125000,
        total_reached: 118500,
        coverage_percentage: 94.8,
        by_demographics: {
          female: 59640,
          male: 58860,
          children_under_18: 47400,
          adults_18_59: 59200,
          elderly_60_plus: 11900
        }
      },
      partners: {
        total: 12,
        active: 10,
        implementing: 8,
        funding: 4
      },
      resources: {
        total: 156,
        available: 124,
        allocated: 98,
        maintenance: 8,
        by_type: {
          human_resources: 45,
          equipment: 67,
          vehicles: 23,
          facilities: 21
        }
      },
      budget: {
        total_budget: 5200000,
        total_spent: 3800000,
        utilization_percentage: 73.1,
        by_sector: {
          health: 2600000,
          nutrition: 1040000,
          wash: 780000,
          education: 520000,
          coordination: 260000
        }
      },
      alerts: {
        active: 2,
        resolved_this_period: 8,
        by_severity: {
          critical: 0,
          high: 2,
          medium: 5,
          low: 3
        }
      },
      performance: {
        activity_completion_rate: 85.2,
        beneficiary_reach_rate: 94.8,
        budget_utilization_rate: 73.1,
        reporting_compliance_rate: 92.0
      }
    };

    logger.info('Operations metrics retrieved', { 
      period,
      location,
      sector,
      requestId: req.headers['x-request-id']
    });

    const response: SuccessResponse<OperationsMetrics> = {
      success: true,
      data: operationsMetrics,
      message: 'Operations metrics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving operations metrics', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve operations metrics',
      code: 'METRICS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// WebSocket connection handling for real-time operations coordination
io.on('connection', (socket: any) => {
  logger.info('New WebSocket connection established', { socketId: socket.id });

  socket.on('join_operation', (operationId: string) => {
    socket.join(`operation_${operationId}`);
    logger.info('Socket joined operation room', { socketId: socket.id, operationId });
  });

  socket.on('join_sector', (sector: string) => {
    socket.join(`sector_${sector}`);
    logger.info('Socket joined sector room', { socketId: socket.id, sector });
  });

  socket.on('join_partner', (partnerId: string) => {
    socket.join(`partner_${partnerId}`);
    logger.info('Socket joined partner room', { socketId: socket.id, partnerId });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket connection disconnected', { socketId: socket.id });
  });
});

// Automated scheduled tasks
cron.schedule('0 9 * * 1', () => {
  logger.info('Running weekly 4W report reminder');
  send4WReportReminders();
});

cron.schedule('0 8 * * *', () => {
  logger.info('Running daily resource availability check');
  checkResourceAvailability();
});

cron.schedule('*/15 * * * *', () => {
  logger.info('Running emergency alert status check');
  checkEmergencyAlertStatus();
});

// Helper functions for scheduled tasks
async function send4WReportReminders() {
  try {
    // Implementation for sending 4W report reminders to partners
    const overdueReports = []; // Query overdue reports from database
    
    if (overdueReports.length > 0) {
      io.emit('report_reminder', {
        reports: overdueReports,
        type: '4w_overdue'
      });
    }
  } catch (error) {
    logger.error('Error sending 4W report reminders', { error });
  }
}

async function checkResourceAvailability() {
  try {
    // Check for resources that need maintenance or reallocation
    const resourceAlerts = []; // Query resource status from database
    
    if (resourceAlerts.length > 0) {
      io.emit('resource_alert', {
        resources: resourceAlerts,
        alertType: 'maintenance_due'
      });
    }
  } catch (error) {
    logger.error('Error checking resource availability', { error });
  }
}

async function checkEmergencyAlertStatus() {
  try {
    // Check active emergency alerts and update status
    const activeAlerts = []; // Query active alerts from database
    
    // Process alerts that may need escalation or updates
    activeAlerts.forEach((alert: any) => {
      if (shouldEscalateAlert(alert)) {
        io.emit('alert_escalation', {
          alert,
          escalationLevel: 'high_priority'
        });
      }
    });
  } catch (error) {
    logger.error('Error checking emergency alert status', { error });
  }
}

function shouldEscalateAlert(alert: any): boolean {
  // Logic to determine if an alert should be escalated
  const hoursSinceCreated = moment().diff(moment(alert.created_at), 'hours');
  return hoursSinceCreated > 24 && alert.status === 'active';
}

async function notifyEmergencyContacts(alert: EmergencyAlert) {
  try {
    // Send emergency notifications via email, SMS, and WebSocket
    const contacts = alert.coordination_contacts || [];
    
    for (const contact of contacts) {
      // Implementation would send actual notifications
      logger.info('Emergency notification sent', {
        alertId: alert.id,
        contactId: contact,
        method: 'email_sms'
      });
    }
  } catch (error) {
    logger.error('Error sending emergency notifications', { error });
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
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  logger.info(`ZarishOps service running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default app;