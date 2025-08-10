// Common Types and Utilities

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
  timestamp: Date;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  field?: string;
  validationErrors?: ValidationError[];
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ResponseMetadata {
  totalCount?: number;
  pageCount?: number;
  currentPage?: number;
  pageSize?: number;
  hasMore?: boolean;
  executionTime?: number;
  cacheHit?: boolean;
  warnings?: string[];
}

// Pagination Types
export interface PaginationRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search and Filter Types
export interface SearchRequest {
  query?: string;
  filters?: Filter[];
  pagination?: PaginationRequest;
  facets?: string[];
  highlighting?: boolean;
  fuzzySearch?: boolean;
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'regex';

export interface SearchResponse<T> {
  results: T[];
  totalResults: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  executionTime: number;
  searchId?: string;
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

// Geographic Types
export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface GeoArea {
  name: string;
  type: 'country' | 'region' | 'district' | 'camp' | 'facility';
  code: string;
  boundaries?: GeoBoundary;
  center?: GeoPoint;
  population?: number;
  parentId?: string;
}

export interface GeoBoundary {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

// File and Media Types
export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // bytes
  path: string;
  url?: string;
  thumbnailUrl?: string;
  checksum: string;
  uploadedAt: Date;
  uploadedBy: string;
  metadata: FileMetadata;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  tags?: string[];
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number; // for videos/audio
  pages?: number; // for documents
  encoding?: string;
  bitrate?: number;
  sampleRate?: number;
  colorSpace?: string;
  compression?: string;
  exif?: { [key: string]: any };
  customFields?: { [key: string]: any };
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  details?: string;
  actionUrl?: string;
  actionLabel?: string;
  recipientId: string;
  recipientType: 'user' | 'role' | 'group' | 'organization';
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: { [key: string]: any };
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  address: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
}

// Configuration Types
export interface ConfigurationItem {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  scope: 'global' | 'organization' | 'facility' | 'user';
  category: string;
  description?: string;
  defaultValue?: any;
  validation?: ValidationRule;
  sensitive: boolean;
  readonly: boolean;
  lastModified: Date;
  modifiedBy: string;
}

export interface ValidationRule {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: any[];
  customValidator?: string;
}

// Workflow Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  permissions: string[];
  active: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'webhook' | 'api';
  configuration: { [key: string]: any };
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'approval' | 'delay' | 'notification' | 'custom';
  configuration: { [key: string]: any };
  nextSteps: string[];
  onSuccess?: string;
  onFailure?: string;
  timeout?: number;
  retries?: number;
}

export interface WorkflowVariable {
  name: string;
  type: string;
  defaultValue?: any;
  required: boolean;
  description?: string;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  currentStep?: string;
  startedAt: Date;
  completedAt?: Date;
  startedBy: string;
  variables: { [key: string]: any };
  executionLog: WorkflowLogEntry[];
  metadata: { [key: string]: any };
}

export interface WorkflowLogEntry {
  timestamp: Date;
  stepId: string;
  action: string;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  message?: string;
  data?: { [key: string]: any };
  error?: string;
  executionTime?: number;
}

// Audit Types
export interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: GeoPoint;
  changes?: FieldChange[];
  metadata: AuditMetadata;
  riskScore?: number;
}

export interface FieldChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  dataType: string;
  sensitive: boolean;
}

export interface AuditMetadata {
  source: string;
  version: string;
  correlationId?: string;
  businessContext?: { [key: string]: any };
  complianceFlags?: string[];
  retention: number; // days
}

// Event Types
export interface DomainEvent {
  id: string;
  type: string;
  aggregateType: string;
  aggregateId: string;
  version: number;
  timestamp: Date;
  userId?: string;
  correlationId?: string;
  causationId?: string;
  data: { [key: string]: any };
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  traceId?: string;
  spanId?: string;
  sessionId?: string;
  clientId?: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  customProperties?: { [key: string]: any };
}

// Cache Types
export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt?: Date;
  createdAt: Date;
  lastAccessed: Date;
  hitCount: number;
  size: number; // bytes
  tags: string[];
  metadata?: { [key: string]: any };
}

export interface CacheStatistics {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
  memoryUsage: number; // bytes
  entryCount: number;
  avgHitTime: number; // milliseconds
  avgMissTime: number; // milliseconds
  evictionCount: number;
  lastReset: Date;
}

// Health Check Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  duration: number; // milliseconds
  checks: HealthCheck[];
  metadata?: { [key: string]: any };
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  duration: number; // milliseconds
  message?: string;
  data?: { [key: string]: any };
  error?: string;
}

// Rate Limiting Types
export interface RateLimitRule {
  id: string;
  name: string;
  scope: 'global' | 'user' | 'ip' | 'api_key' | 'custom';
  identifier?: string;
  limit: number;
  window: number; // seconds
  strategy: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
  burst?: number;
  refillRate?: number;
  enabled: boolean;
  actions: RateLimitAction[];
  metadata?: { [key: string]: any };
}

export interface RateLimitAction {
  threshold: number; // percentage of limit
  action: 'warn' | 'throttle' | 'block' | 'captcha' | 'notify';
  duration?: number; // seconds
  message?: string;
}

export interface RateLimitStatus {
  identifier: string;
  ruleId: string;
  currentCount: number;
  limit: number;
  remaining: number;
  resetTime: Date;
  blocked: boolean;
  blockedUntil?: Date;
}

// Feature Flag Types
export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  targeting: FeatureTargeting;
  variations: FeatureVariation[];
  defaultVariation: string;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

export interface FeatureTargeting {
  rules: TargetingRule[];
  defaultRule?: TargetingRule;
}

export interface TargetingRule {
  id: string;
  conditions: TargetingCondition[];
  variation: string;
  rolloutPercentage?: number;
  enabled: boolean;
}

export interface TargetingCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface FeatureVariation {
  key: string;
  name: string;
  value: any;
  description?: string;
}

// Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'message_queue' | 'webhook' | 'custom';
  provider: string;
  enabled: boolean;
  settings: { [key: string]: any };
  authentication: IntegrationAuth;
  mapping: DataMapping[];
  errorHandling: ErrorHandling;
  monitoring: IntegrationMonitoring;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationAuth {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key' | 'certificate';
  credentials: { [key: string]: any };
  tokenEndpoint?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
}

export interface ErrorHandling {
  retryPolicy: RetryPolicy;
  deadLetterQueue: boolean;
  errorNotification: boolean;
  circuitBreaker: CircuitBreakerConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  multiplier?: number;
  jitter?: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // milliseconds
  halfOpenMaxCalls: number;
}

export interface IntegrationMonitoring {
  healthChecks: boolean;
  metrics: boolean;
  logging: boolean;
  alerting: boolean;
  dashboard: boolean;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Constants
export const SYSTEM_USER_ID = 'system';
export const ANONYMOUS_USER_ID = 'anonymous';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
  UNDEFINED: 'undefined',
} as const;

// Enums
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  ARCHIVED = 'archived',
}