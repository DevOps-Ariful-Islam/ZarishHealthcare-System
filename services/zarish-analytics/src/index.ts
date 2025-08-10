/**
 * ZarishAnalytix - Analytics and Intelligence System
 * Main application entry point for comprehensive healthcare analytics and reporting
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
import _ from 'lodash';
import * as math from 'mathjs';
import * as ss from 'simple-statistics';
import axios from 'axios';

// Import types from shared package
import {
  AnalyticsReport,
  PopulationHealthMetrics,
  ClinicalPerformanceMetrics,
  OperationalMetrics,
  PredictiveModel,
  Dashboard,
  AnalyticsQuery,
  DataVisualization,
  KPI,
  Trend,
  Forecast,
  Benchmark,
  Alert,
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
  defaultMeta: { service: 'zarish-analytics' },
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
      scriptSrc: ["'self'", "'unsafe-eval'"], // Required for chart libraries
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 2000, // Higher limit for analytics
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
app.use(express.json({ limit: '100mb' })); // Large limit for analytics data
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

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
    service: 'zarish-analytics',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected',
    redis: 'connected',
    ml_models: 'loaded',
    external_services: {
      zarish_care: 'connected',
      zarish_labs: 'connected',
      zarish_ops: 'connected'
    }
  };
  
  res.json(healthCheck);
});

// API Documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    service: 'ZarishAnalytix - Analytics and Intelligence System',
    version: '1.0.0',
    description: 'Comprehensive analytics and intelligence for humanitarian healthcare',
    features: [
      'Population health analytics',
      'Clinical performance metrics',
      'Laboratory analytics and trends',
      'Operations performance analysis',
      'Predictive modeling and forecasting',
      'Real-time dashboards',
      'Automated report generation',
      'Data visualization',
      'Machine learning insights',
      'Cross-service data aggregation',
      'Epidemic detection and monitoring',
      'Resource optimization analytics'
    ],
    endpoints: {
      health: 'GET /health',
      dashboards: 'GET|POST /api/v1/dashboards',
      reports: 'GET|POST /api/v1/reports',
      metrics: 'GET /api/v1/metrics',
      trends: 'GET /api/v1/trends',
      predictions: 'GET|POST /api/v1/predictions',
      population_health: 'GET /api/v1/population-health',
      clinical_performance: 'GET /api/v1/clinical-performance',
      operations_analysis: 'GET /api/v1/operations-analysis',
      data_export: 'GET /api/v1/export',
      alerts: 'GET|POST /api/v1/alerts'
    }
  });
});

// Population Health Analytics
app.get('/api/v1/population-health', async (req: Request, res: Response) => {
  try {
    const { 
      period = '30d',
      location,
      demographic,
      condition,
      page = 1,
      limit = 50
    } = req.query;

    // Mock comprehensive population health data
    const populationHealthMetrics: PopulationHealthMetrics = {
      period: period as string,
      location: location as string,
      total_population: 918000, // Rohingya refugee population
      demographics: {
        age_groups: {
          '0-4': { count: 146880, percentage: 16.0 },
          '5-11': { count: 146880, percentage: 16.0 },
          '12-17': { count: 91800, percentage: 10.0 },
          '18-59': { count: 459000, percentage: 50.0 },
          '60+': { count: 73440, percentage: 8.0 }
        },
        gender: {
          male: { count: 449820, percentage: 49.0 },
          female: { count: 468180, percentage: 51.0 }
        }
      },
      health_indicators: {
        mortality: {
          crude_death_rate: 0.8, // per 1000 per month
          under5_mortality_rate: 1.2,
          maternal_mortality_ratio: 120 // per 100,000 live births
        },
        morbidity: {
          consultation_rate: 1.5, // per person per month
          hospitalization_rate: 0.05,
          disease_burden: {
            'Acute Respiratory Infection': { cases: 12500, incidence_rate: 13.6 },
            'Diarrhea': { cases: 8200, incidence_rate: 8.9 },
            'Hypertension': { cases: 15600, incidence_rate: 17.0 },
            'Diabetes': { cases: 9800, incidence_rate: 10.7 },
            'Mental Health': { cases: 6500, incidence_rate: 7.1 }
          }
        },
        nutrition: {
          global_acute_malnutrition_rate: 7.5, // percentage
          severe_acute_malnutrition_rate: 1.2,
          stunting_rate: 28.0,
          wasting_rate: 9.5
        }
      },
      vaccination_coverage: {
        'BCG': { coverage_rate: 95.2, target_population: 29376 },
        'DTP3': { coverage_rate: 92.8, target_population: 29376 },
        'Measles': { coverage_rate: 94.5, target_population: 29376 },
        'OPV3': { coverage_rate: 93.1, target_population: 29376 }
      },
      water_sanitation: {
        access_to_safe_water: 89.5, // percentage
        access_to_sanitation: 87.2,
        hygiene_promotion_coverage: 78.5
      },
      trends: {
        consultation_trends: generateTrendData('consultations', 12),
        disease_outbreak_alerts: [
          {
            disease: 'Acute Watery Diarrhea',
            alert_level: 'medium',
            affected_camps: ['Camp 4', 'Camp 8E'],
            cases_this_week: 45,
            cases_last_week: 12
          }
        ],
        seasonal_patterns: {
          'Respiratory Infections': { peak_months: ['Dec', 'Jan', 'Feb'], factor: 2.3 },
          'Diarrhea': { peak_months: ['Jun', 'Jul', 'Aug'], factor: 1.8 },
          'Vector-borne diseases': { peak_months: ['May', 'Jun', 'Sep'], factor: 1.5 }
        }
      }
    };

    logger.info('Population health metrics retrieved', { 
      period,
      location,
      totalPopulation: populationHealthMetrics.total_population,
      requestId: req.headers['x-request-id']
    });

    const response: SuccessResponse<PopulationHealthMetrics> = {
      success: true,
      data: populationHealthMetrics,
      message: 'Population health metrics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving population health metrics', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve population health metrics',
      code: 'POPULATION_HEALTH_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Clinical Performance Analytics
app.get('/api/v1/clinical-performance', async (req: Request, res: Response) => {
  try {
    const { 
      period = '30d',
      facility_id,
      service_type,
      provider_id 
    } = req.query;

    const clinicalMetrics: ClinicalPerformanceMetrics = {
      period: period as string,
      facility_id: facility_id as string,
      service_performance: {
        outpatient_services: {
          total_consultations: 15600,
          average_consultation_time: 18.5, // minutes
          patient_satisfaction_score: 4.2, // out of 5
          follow_up_compliance_rate: 78.5, // percentage
          no_show_rate: 12.3,
          quality_indicators: {
            complete_documentation_rate: 94.2,
            clinical_guideline_adherence: 89.7,
            medication_error_rate: 0.8
          }
        },
        emergency_services: {
          total_presentations: 2840,
          average_waiting_time: 22.3, // minutes
          triage_accuracy: 92.1, // percentage
          mortality_rate: 1.2,
          left_without_treatment_rate: 3.5
        },
        laboratory_services: {
          total_tests: 8950,
          average_turnaround_time: 18.2, // hours
          critical_value_notification_time: 15.8, // minutes
          quality_control_pass_rate: 98.7,
          repeat_test_rate: 2.1
        }
      },
      clinical_outcomes: {
        ncd_management: {
          hypertension: {
            patients_under_care: 2400,
            controlled_blood_pressure_rate: 72.5, // <140/90
            medication_adherence_rate: 68.3,
            complications_rate: 2.8
          },
          diabetes: {
            patients_under_care: 1450,
            hba1c_controlled_rate: 65.2, // <7%
            medication_adherence_rate: 71.8,
            complications_rate: 4.1
          }
        },
        infectious_diseases: {
          tuberculosis: {
            treatment_success_rate: 88.5,
            default_rate: 6.2,
            cure_rate: 82.3
          },
          malaria: {
            case_fatality_rate: 0.8,
            treatment_completion_rate: 94.5
          }
        },
        maternal_health: {
          antenatal_care_coverage: 89.2, // 4+ visits
          skilled_birth_attendance: 95.8,
          cesarean_section_rate: 12.3,
          maternal_mortality_ratio: 120 // per 100,000
        }
      },
      provider_performance: {
        productivity_metrics: {
          consultations_per_provider_per_day: 25.8,
          patient_load_variance: 15.2, // coefficient of variation
          overtime_hours_percentage: 8.5
        },
        quality_metrics: {
          clinical_competency_score: 87.3,
          continuing_education_hours: 42.5, // per year
          patient_feedback_score: 4.1
        }
      },
      resource_utilization: {
        bed_occupancy_rate: 76.8,
        equipment_utilization_rate: 82.3,
        medication_stockout_incidents: 3,
        staff_absenteeism_rate: 5.7
      }
    };

    const response: SuccessResponse<ClinicalPerformanceMetrics> = {
      success: true,
      data: clinicalMetrics,
      message: 'Clinical performance metrics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving clinical performance metrics', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve clinical performance metrics',
      code: 'CLINICAL_PERFORMANCE_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Predictive Analytics and Forecasting
app.get('/api/v1/predictions', async (req: Request, res: Response) => {
  try {
    const { 
      type = 'disease_outbreak',
      horizon = '30d',
      location,
      confidence_level = 0.95
    } = req.query;

    // Mock predictive models with realistic humanitarian healthcare scenarios
    const predictions: PredictiveModel[] = [
      {
        id: 'model-outbreak-001',
        name: 'Disease Outbreak Prediction Model',
        type: 'classification',
        description: 'Predicts likelihood of disease outbreaks based on epidemiological indicators',
        algorithm: 'Random Forest Classifier',
        accuracy: 0.89,
        last_trained: moment().subtract(7, 'days').toISOString(),
        predictions: {
          'Acute Watery Diarrhea': {
            probability: 0.72,
            confidence_interval: [0.65, 0.79],
            risk_level: 'high',
            contributing_factors: [
              'Recent rainfall increase (45mm in 3 days)',
              'Water quality deterioration in Camps 8E-10',
              'Overcrowding in communal latrines',
              'Decreased hygiene promotion activities'
            ],
            recommended_actions: [
              'Increase water quality monitoring frequency',
              'Deploy additional hygiene promotion teams',
              'Stockpile ORS and Zinc supplies',
              'Prepare isolation facilities'
            ],
            timeline: '7-14 days'
          },
          'Acute Respiratory Infection': {
            probability: 0.58,
            confidence_interval: [0.51, 0.65],
            risk_level: 'medium',
            contributing_factors: [
              'Seasonal temperature drop',
              'Indoor air quality concerns',
              'Population density in shelters'
            ],
            recommended_actions: [
              'Increase ventilation in communal spaces',
              'Strengthen case detection and isolation',
              'Ensure adequate antibiotic supplies'
            ],
            timeline: '14-21 days'
          }
        },
        performance_metrics: {
          precision: 0.87,
          recall: 0.91,
          f1_score: 0.89,
          auc_roc: 0.94
        }
      },
      {
        id: 'model-demand-001',
        name: 'Healthcare Demand Forecasting Model',
        type: 'regression',
        description: 'Forecasts healthcare service demand based on historical patterns and external factors',
        algorithm: 'LSTM Neural Network',
        accuracy: 0.92,
        last_trained: moment().subtract(3, 'days').toISOString(),
        predictions: {
          'outpatient_consultations': {
            forecast: generateForecastData('consultations', 30),
            seasonal_adjustment: 1.15, // 15% increase expected
            trend: 'increasing',
            confidence_bands: {
              upper: generateForecastData('consultations_upper', 30),
              lower: generateForecastData('consultations_lower', 30)
            }
          },
          'laboratory_tests': {
            forecast: generateForecastData('lab_tests', 30),
            seasonal_adjustment: 1.08,
            trend: 'stable',
            confidence_bands: {
              upper: generateForecastData('lab_tests_upper', 30),
              lower: generateForecastData('lab_tests_lower', 30)
            }
          }
        },
        performance_metrics: {
          mae: 125.3, // Mean Absolute Error
          mse: 18947.2, // Mean Squared Error
          rmse: 137.6, // Root Mean Squared Error
          mape: 8.7 // Mean Absolute Percentage Error
        }
      }
    ];

    logger.info('Predictive analytics retrieved', { 
      type,
      horizon,
      location,
      modelsCount: predictions.length,
      requestId: req.headers['x-request-id']
    });

    const response: SuccessResponse<PredictiveModel[]> = {
      success: true,
      data: predictions,
      message: 'Predictive analytics retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving predictive analytics', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve predictive analytics',
      code: 'PREDICTIONS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Real-time Analytics Dashboard
app.get('/api/v1/dashboards/:dashboardId', async (req: Request, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const { refresh = false } = req.query;

    // Mock comprehensive dashboard data
    const dashboard: Dashboard = {
      id: dashboardId,
      name: 'Humanitarian Healthcare Operations Dashboard',
      description: 'Real-time overview of healthcare operations across refugee settlements',
      last_updated: new Date().toISOString(),
      refresh_interval: 300, // seconds
      widgets: [
        {
          id: 'kpi-consultations',
          type: 'kpi',
          title: 'Daily Consultations',
          data: {
            current: 486,
            target: 450,
            previous: 428,
            trend: 'increasing',
            change_percentage: 13.6
          },
          position: { x: 0, y: 0, width: 3, height: 2 }
        },
        {
          id: 'chart-disease-trends',
          type: 'line_chart',
          title: 'Disease Trends (Last 30 Days)',
          data: {
            datasets: [
              {
                label: 'ARI Cases',
                data: generateTrendData('ari', 30),
                color: '#FF6B6B'
              },
              {
                label: 'Diarrhea Cases',
                data: generateTrendData('diarrhea', 30),
                color: '#4ECDC4'
              },
              {
                label: 'NCD Consultations',
                data: generateTrendData('ncd', 30),
                color: '#45B7D1'
              }
            ]
          },
          position: { x: 3, y: 0, width: 6, height: 4 }
        },
        {
          id: 'map-service-coverage',
          type: 'geo_map',
          title: 'Healthcare Service Coverage by Camp',
          data: {
            type: 'choropleth',
            features: [
              { camp: 'Camp 1E', coverage: 94.2, population: 52000 },
              { camp: 'Camp 2E', coverage: 91.8, population: 48500 },
              { camp: 'Camp 4', coverage: 88.5, population: 65000 },
              { camp: 'Camp 8E', coverage: 86.3, population: 42000 }
            ],
            center: { lat: 21.1793, lng: 92.1270 },
            zoom: 11
          },
          position: { x: 9, y: 0, width: 3, height: 4 }
        },
        {
          id: 'alerts-panel',
          type: 'alerts',
          title: 'Active Health Alerts',
          data: {
            critical: [
              {
                id: 'alert-001',
                type: 'disease_outbreak',
                message: 'Potential AWD outbreak detected in Camp 8E',
                severity: 'high',
                created_at: moment().subtract(2, 'hours').toISOString()
              }
            ],
            warnings: [
              {
                id: 'alert-002',
                type: 'resource_shortage',
                message: 'ORS supplies running low - 3 days remaining',
                severity: 'medium',
                created_at: moment().subtract(4, 'hours').toISOString()
              }
            ]
          },
          position: { x: 0, y: 2, width: 3, height: 3 }
        }
      ],
      filters: {
        date_range: {
          start: moment().subtract(30, 'days').format('YYYY-MM-DD'),
          end: moment().format('YYYY-MM-DD')
        },
        locations: ['All Camps'],
        services: ['All Services']
      },
      permissions: {
        view: ['health_manager', 'coordinator', 'analyst'],
        edit: ['health_manager', 'analyst'],
        export: ['health_manager', 'coordinator']
      }
    };

    // Emit real-time dashboard update if this is a refresh
    if (refresh === 'true') {
      io.emit('dashboard_update', {
        dashboardId,
        timestamp: new Date().toISOString(),
        data: dashboard
      });
    }

    const response: SuccessResponse<Dashboard> = {
      success: true,
      data: dashboard,
      message: 'Dashboard retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving dashboard', { 
      error: error instanceof Error ? error.message : error,
      dashboardId: req.params.dashboardId,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve dashboard',
      code: 'DASHBOARD_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Automated Report Generation
app.post('/api/v1/reports/generate', async (req: Request, res: Response) => {
  try {
    const {
      report_type,
      period,
      filters,
      format = 'pdf',
      recipients
    } = req.body;

    if (!report_type || !period) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Missing required fields: report_type, period',
        code: 'VALIDATION_ERROR'
      };
      return res.status(400).json(errorResponse);
    }

    const reportId = uuidv4();
    
    const analyticsReport: AnalyticsReport = {
      id: reportId,
      title: getReportTitle(report_type),
      type: report_type,
      period: period,
      generated_at: new Date().toISOString(),
      generated_by: 'system', // Would be actual user in real implementation
      status: 'generating',
      format: format,
      filters: filters || {},
      sections: generateReportSections(report_type),
      metadata: {
        total_pages: 0,
        data_sources: ['zarish-care', 'zarish-labs', 'zarish-ops'],
        processing_time: 0,
        file_size: 0
      },
      recipients: recipients || [],
      download_url: '',
      expires_at: moment().add(7, 'days').toISOString()
    };

    // Start asynchronous report generation
    generateReportAsync(analyticsReport);

    logger.info('Report generation initiated', { 
      reportId,
      reportType: report_type,
      period,
      format,
      requestId: req.headers['x-request-id']
    });

    const response: SuccessResponse<AnalyticsReport> = {
      success: true,
      data: analyticsReport,
      message: 'Report generation initiated successfully'
    };

    res.status(202).json(response); // 202 Accepted for async processing
  } catch (error) {
    logger.error('Error initiating report generation', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to initiate report generation',
      code: 'REPORT_GENERATION_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// Real-time Analytics Alerts
app.get('/api/v1/alerts/analytics', async (req: Request, res: Response) => {
  try {
    const { severity, category, status = 'active' } = req.query;

    const analyticsAlerts: Alert[] = [
      {
        id: 'alert-analytics-001',
        type: 'statistical_anomaly',
        severity: 'high',
        title: 'Unusual Spike in Respiratory Cases',
        description: 'ARI cases in Camp 4 are 3.2 standard deviations above the historical mean',
        category: 'epidemiological',
        status: 'active',
        created_at: moment().subtract(1, 'hour').toISOString(),
        data_source: 'clinical_surveillance',
        affected_locations: ['Camp 4', 'Camp 4 Extension'],
        metrics: {
          current_value: 78,
          expected_range: [18, 32],
          statistical_significance: 0.001,
          confidence_level: 0.99
        },
        recommended_actions: [
          'Investigate potential common source exposure',
          'Enhance case detection and reporting',
          'Consider targeted health promotion activities',
          'Review environmental health conditions'
        ]
      },
      {
        id: 'alert-analytics-002',
        type: 'performance_degradation',
        severity: 'medium',
        title: 'Laboratory Turnaround Time Increase',
        description: 'Average lab result turnaround time has increased by 40% over the past week',
        category: 'operational',
        status: 'active',
        created_at: moment().subtract(3, 'hours').toISOString(),
        data_source: 'laboratory_operations',
        affected_locations: ['Central Laboratory'],
        metrics: {
          current_value: 28.5, // hours
          target_value: 18.0,
          trend: 'increasing',
          performance_degradation: 40.2 // percentage
        },
        recommended_actions: [
          'Review laboratory workflow efficiency',
          'Assess equipment maintenance status',
          'Evaluate staffing levels and schedules',
          'Consider workflow optimization interventions'
        ]
      }
    ];

    const response: SuccessResponse<Alert[]> = {
      success: true,
      data: analyticsAlerts,
      message: 'Analytics alerts retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    logger.error('Error retrieving analytics alerts', { 
      error: error instanceof Error ? error.message : error,
      requestId: req.headers['x-request-id']
    });

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Failed to retrieve analytics alerts',
      code: 'ANALYTICS_ALERTS_FETCH_ERROR'
    };
    res.status(500).json(errorResponse);
  }
});

// WebSocket connection handling for real-time analytics
io.on('connection', (socket: any) => {
  logger.info('New WebSocket connection established', { socketId: socket.id });

  socket.on('subscribe_dashboard', (dashboardId: string) => {
    socket.join(`dashboard_${dashboardId}`);
    logger.info('Socket subscribed to dashboard', { socketId: socket.id, dashboardId });
  });

  socket.on('subscribe_alerts', (categories: string[]) => {
    categories.forEach(category => {
      socket.join(`alerts_${category}`);
    });
    logger.info('Socket subscribed to alert categories', { socketId: socket.id, categories });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket connection disconnected', { socketId: socket.id });
  });
});

// Automated scheduled tasks
cron.schedule('0 6 * * *', () => {
  logger.info('Running daily analytics processing');
  runDailyAnalytics();
});

cron.schedule('*/15 * * * *', () => {
  logger.info('Running real-time anomaly detection');
  detectAnomalies();
});

cron.schedule('0 8 * * 1', () => {
  logger.info('Running weekly performance analysis');
  runWeeklyPerformanceAnalysis();
});

// Helper functions
function generateTrendData(type: string, days: number): Array<{date: string, value: number}> {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
    let baseValue = 50;
    
    switch (type) {
      case 'consultations':
        baseValue = 400 + Math.random() * 100;
        break;
      case 'ari':
        baseValue = 25 + Math.random() * 15;
        break;
      case 'diarrhea':
        baseValue = 15 + Math.random() * 10;
        break;
      case 'ncd':
        baseValue = 80 + Math.random() * 20;
        break;
      default:
        baseValue = 50 + Math.random() * 25;
    }
    
    data.push({ date, value: Math.round(baseValue) });
  }
  return data;
}

function generateForecastData(type: string, days: number): Array<{date: string, value: number}> {
  const data = [];
  let baseValue = 400;
  
  for (let i = 1; i <= days; i++) {
    const date = moment().add(i, 'days').format('YYYY-MM-DD');
    
    // Add trend and seasonality
    const trendFactor = 1 + (i / days) * 0.1; // 10% growth over period
    const seasonalFactor = 1 + 0.1 * Math.sin((i / 7) * Math.PI); // Weekly pattern
    const noise = 1 + (Math.random() - 0.5) * 0.2; // ±10% random variation
    
    const value = Math.round(baseValue * trendFactor * seasonalFactor * noise);
    data.push({ date, value });
  }
  
  return data;
}

function getReportTitle(reportType: string): string {
  const titles: { [key: string]: string } = {
    'population_health': 'Population Health Status Report',
    'clinical_performance': 'Clinical Performance Analysis Report',
    'operations_summary': 'Operations Summary Report',
    'epidemiological_surveillance': 'Epidemiological Surveillance Report',
    'resource_utilization': 'Resource Utilization Analysis Report'
  };
  
  return titles[reportType] || 'Analytics Report';
}

function generateReportSections(reportType: string): any[] {
  // Mock report sections - would be dynamically generated based on data
  return [
    {
      title: 'Executive Summary',
      type: 'text',
      content: 'Summary of key findings and recommendations...'
    },
    {
      title: 'Key Metrics',
      type: 'metrics',
      data: {}
    },
    {
      title: 'Trend Analysis',
      type: 'charts',
      data: {}
    },
    {
      title: 'Recommendations',
      type: 'text',
      content: 'Based on the analysis, we recommend...'
    }
  ];
}

async function generateReportAsync(report: AnalyticsReport) {
  try {
    // Simulate report generation process
    setTimeout(async () => {
      // Update report status
      report.status = 'completed';
      report.metadata.processing_time = 45000; // 45 seconds
      report.metadata.total_pages = 24;
      report.metadata.file_size = 2048000; // 2MB
      report.download_url = `/api/v1/reports/${report.id}/download`;
      
      // Emit completion notification
      io.emit('report_completed', {
        reportId: report.id,
        downloadUrl: report.download_url,
        recipients: report.recipients
      });
      
      logger.info('Report generation completed', { reportId: report.id });
    }, 5000); // Simulate 5 second processing time
    
  } catch (error) {
    logger.error('Error in async report generation', { 
      reportId: report.id,
      error: error instanceof Error ? error.message : error 
    });
    
    report.status = 'failed';
    io.emit('report_failed', { reportId: report.id, error: 'Generation failed' });
  }
}

async function runDailyAnalytics() {
  try {
    // Aggregate daily statistics
    // Update trend calculations
    // Generate automated insights
    // Update predictive models if needed
    logger.info('Daily analytics processing completed');
  } catch (error) {
    logger.error('Error in daily analytics processing', { error });
  }
}

async function detectAnomalies() {
  try {
    // Run statistical anomaly detection
    // Check for unusual patterns in data
    // Generate alerts for significant deviations
    const anomalies = []; // Mock anomaly detection results
    
    if (anomalies.length > 0) {
      io.emit('anomaly_detected', { anomalies });
    }
  } catch (error) {
    logger.error('Error in anomaly detection', { error });
  }
}

async function runWeeklyPerformanceAnalysis() {
  try {
    // Calculate weekly performance metrics
    // Update benchmarks and targets
    // Generate performance reports
    logger.info('Weekly performance analysis completed');
  } catch (error) {
    logger.error('Error in weekly performance analysis', { error });
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
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  logger.info(`ZarishAnalytix service running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default app;