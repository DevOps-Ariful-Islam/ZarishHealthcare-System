// Data Synchronization and Offline Types

export interface SyncStatus {
  lastSync: Date;
  syncVersion: number;
  conflicts?: string[];
  status: 'synced' | 'pending' | 'conflict' | 'error';
  errorMessage?: string;
  retryCount?: number;
  nextRetry?: Date;
}

export interface SyncConfiguration {
  id: string;
  name: string;
  enabled: boolean;
  syncType: 'bidirectional' | 'push_only' | 'pull_only';
  frequency: 'real_time' | 'interval' | 'manual' | 'event_driven';
  interval?: number; // minutes for interval sync
  priority: 'high' | 'medium' | 'low';
  dataTypes: string[];
  filters: SyncFilter[];
  conflictResolution: ConflictResolution;
  retryPolicy: RetryPolicy;
  bandwidth: BandwidthSettings;
  security: SyncSecurity;
  monitoring: SyncMonitoring;
  metadata: SyncMetadata;
}

export interface SyncFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface ConflictResolution {
  strategy: 'last_write_wins' | 'first_write_wins' | 'merge' | 'manual' | 'custom';
  customResolver?: string;
  fieldPriority?: { [field: string]: 'server' | 'client' | 'newer' | 'older' };
  autoMergeRules?: MergeRule[];
  escalationPolicy: EscalationPolicy;
}

export interface MergeRule {
  field: string;
  rule: 'concatenate' | 'sum' | 'max' | 'min' | 'newer_value' | 'custom';
  separator?: string;
  customLogic?: string;
}

export interface EscalationPolicy {
  escalateAfter: number; // minutes
  escalateTo: string[];
  notifications: boolean;
  freezeSync: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number; // seconds
  maxDelay: number; // seconds
  exponentialBase?: number;
  jitter: boolean;
  circuitBreaker?: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // seconds
  resetTimeout: number; // seconds
}

export interface BandwidthSettings {
  priorityDataTypes: string[];
  compressionEnabled: boolean;
  compressionLevel: number; // 1-9
  batchSize: number;
  throttleLimit: number; // bytes per second
  adaptiveBandwidth: boolean;
  lowBandwidthMode: LowBandwidthConfig;
}

export interface LowBandwidthConfig {
  enabled: boolean;
  triggerThreshold: number; // kbps
  reducedBatchSize: number;
  priorityOnly: boolean;
  textOnlyMode: boolean;
  imageCompression: boolean;
}

export interface SyncSecurity {
  encryption: boolean;
  encryptionAlgorithm: string;
  keyManagement: 'automatic' | 'manual';
  certificatePinning: boolean;
  integrityChecks: boolean;
  auditLogging: boolean;
  accessControl: string[];
}

export interface SyncMonitoring {
  metrics: boolean;
  alerting: boolean;
  performanceTracking: boolean;
  errorTracking: boolean;
  dashboardEnabled: boolean;
  healthChecks: HealthCheckConfig[];
}

export interface HealthCheckConfig {
  name: string;
  enabled: boolean;
  interval: number; // minutes
  timeout: number; // seconds
  threshold: HealthCheckThreshold;
  escalation: string[];
}

export interface HealthCheckThreshold {
  warning: number;
  critical: number;
  recovery: number;
}

export interface SyncMetadata {
  version: string;
  createdDate: Date;
  lastModified: Date;
  tags: string[];
  environment: 'production' | 'staging' | 'development';
  region: string;
  customFields: { [key: string]: any };
}

// Synchronization Session
export interface SyncSession {
  id: string;
  configId: string;
  sessionType: 'scheduled' | 'manual' | 'event_triggered' | 'retry';
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'partial';
  direction: 'push' | 'pull' | 'bidirectional';
  progress: SyncProgress;
  statistics: SyncStatistics;
  conflicts: SyncConflict[];
  errors: SyncError[];
  logs: SyncLog[];
  metadata: SessionMetadata;
}

export interface SyncProgress {
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  percentage: number;
  estimatedTimeRemaining?: number; // seconds
  currentOperation: string;
  lastUpdate: Date;
}

export interface SyncStatistics {
  dataTransferred: number; // bytes
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  conflicts: number;
  errors: number;
  duration: number; // seconds
  averageRecordSize: number; // bytes
  throughput: number; // records per second
  bandwidthUsed: number; // bytes per second
}

export interface SyncConflict {
  id: string;
  recordId: string;
  recordType: string;
  conflictType: 'data' | 'schema' | 'business_rule' | 'timestamp';
  serverValue: any;
  clientValue: any;
  conflictFields: string[];
  detectedAt: Date;
  status: 'pending' | 'resolved' | 'escalated';
  resolution?: ConflictResolutionResult;
  resolvedBy?: string;
  resolvedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConflictResolutionResult {
  strategy: string;
  resolvedValue: any;
  confidence: number; // 0-100
  automaticResolution: boolean;
  reasoning: string;
  rollbackPossible: boolean;
}

export interface SyncError {
  id: string;
  timestamp: Date;
  errorType: 'network' | 'data' | 'authentication' | 'permission' | 'validation' | 'system';
  errorCode: string;
  errorMessage: string;
  recordId?: string;
  recordType?: string;
  stack?: string;
  context: { [key: string]: any };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryable: boolean;
  actionTaken?: string;
}

export interface SyncLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  operation?: string;
  recordId?: string;
  recordType?: string;
  metadata: { [key: string]: any };
}

export interface SessionMetadata {
  userId?: string;
  deviceId: string;
  clientVersion: string;
  serverVersion: string;
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
  storageAvailable: number; // bytes
  customFields: { [key: string]: any };
}

// Offline Queue Management
export interface OfflineQueue {
  id: string;
  name: string;
  queueType: 'fifo' | 'lifo' | 'priority';
  maxSize: number;
  persistToDisk: boolean;
  encryption: boolean;
  items: OfflineQueueItem[];
  statistics: QueueStatistics;
  configuration: QueueConfiguration;
}

export interface OfflineQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete' | 'custom';
  recordType: string;
  recordId: string;
  payload: any;
  originalPayload?: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  dependencies: string[]; // other queue item IDs
  lastAttempt?: Date;
  nextAttempt?: Date;
  errorMessage?: string;
  metadata: QueueItemMetadata;
}

export interface QueueItemMetadata {
  userId: string;
  deviceId: string;
  sessionId?: string;
  batchId?: string;
  source: string;
  businessContext: { [key: string]: any };
  validation: ValidationResult;
  compression: CompressionInfo;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: Date;
  validatedBy: string;
  schemaVersion: string;
}

export interface CompressionInfo {
  compressed: boolean;
  algorithm?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio?: number;
}

export interface QueueStatistics {
  totalItems: number;
  pendingItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
  averageProcessingTime: number; // seconds
  successRate: number; // percentage
  errorRate: number; // percentage
  lastProcessed?: Date;
  estimatedProcessingTime: number; // seconds
}

export interface QueueConfiguration {
  autoProcess: boolean;
  processInterval: number; // seconds
  batchSize: number;
  concurrentProcessing: number;
  errorHandling: ErrorHandlingConfig;
  notifications: QueueNotificationConfig;
  cleanup: CleanupConfig;
}

export interface ErrorHandlingConfig {
  retryStrategy: 'immediate' | 'exponential_backoff' | 'fixed_interval' | 'custom';
  deadLetterQueue: boolean;
  errorNotification: boolean;
  errorThreshold: number; // percentage
  circuitBreaker: boolean;
}

export interface QueueNotificationConfig {
  enabled: boolean;
  events: string[];
  channels: string[];
  templates: { [event: string]: string };
  throttling: NotificationThrottling;
}

export interface NotificationThrottling {
  enabled: boolean;
  maxPerHour: number;
  consolidation: boolean;
  duplicateSupression: boolean;
}

export interface CleanupConfig {
  enabled: boolean;
  retentionDays: number;
  completedItemsRetention: number; // days
  failedItemsRetention: number; // days
  compressionEnabled: boolean;
  archiving: boolean;
  archiveLocation?: string;
}

// Data Versioning and Change Tracking
export interface DataVersion {
  id: string;
  recordId: string;
  recordType: string;
  version: number;
  parentVersion?: number;
  changeType: 'create' | 'update' | 'delete' | 'restore';
  changes: DataChange[];
  timestamp: Date;
  userId: string;
  sessionId: string;
  deviceId: string;
  source: 'server' | 'client' | 'sync' | 'migration';
  checksum: string;
  metadata: VersionMetadata;
}

export interface DataChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: 'add' | 'modify' | 'remove';
  dataType: string;
  sensitive: boolean;
  validation: FieldValidation;
}

export interface FieldValidation {
  valid: boolean;
  rules: string[];
  errors: string[];
  warnings: string[];
}

export interface VersionMetadata {
  comment?: string;
  reason?: string;
  automatic: boolean;
  batchId?: string;
  migrationId?: string;
  rollbackPossible: boolean;
  tags: string[];
  customFields: { [key: string]: any };
}

// Conflict Resolution
export interface ConflictResolver {
  id: string;
  name: string;
  description: string;
  applicableTypes: string[];
  strategy: ConflictResolutionStrategy;
  rules: ResolutionRule[];
  settings: ResolverSettings;
  statistics: ResolverStatistics;
  enabled: boolean;
  priority: number;
}

export interface ConflictResolutionStrategy {
  type: 'automatic' | 'manual' | 'hybrid';
  algorithm: 'timestamp' | 'priority' | 'merge' | 'business_rule' | 'ml_based' | 'custom';
  confidence_threshold: number; // 0-100
  fallback_strategy?: string;
  parameters: { [key: string]: any };
}

export interface ResolutionRule {
  id: string;
  condition: string; // JSONPath or similar
  action: 'keep_server' | 'keep_client' | 'merge' | 'escalate' | 'custom';
  priority: number;
  parameters: { [key: string]: any };
  enabled: boolean;
}

export interface ResolverSettings {
  timeoutSeconds: number;
  maxIterations: number;
  learningEnabled: boolean;
  auditEnabled: boolean;
  notificationEnabled: boolean;
  escalationEnabled: boolean;
  rollbackEnabled: boolean;
}

export interface ResolverStatistics {
  totalConflicts: number;
  resolvedConflicts: number;
  escalatedConflicts: number;
  averageResolutionTime: number; // seconds
  successRate: number; // percentage
  confidenceDistribution: { [range: string]: number };
  lastExecuted?: Date;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageExecutionTime: number; // milliseconds
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  throughput: number; // conflicts per second
  errorRate: number; // percentage
}

// Device and Client Management
export interface DeviceRegistration {
  deviceId: string;
  deviceName?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'server' | 'embedded';
  platform: DevicePlatform;
  capabilities: DeviceCapabilities;
  status: 'active' | 'inactive' | 'suspended' | 'lost' | 'compromised';
  registrationDate: Date;
  lastSeen: Date;
  userId: string;
  location?: GeoLocation;
  security: DeviceSecurity;
  syncSettings: DeviceSyncSettings;
  limits: DeviceLimits;
  metadata: DeviceMetadata;
}

export interface DevicePlatform {
  operatingSystem: string;
  osVersion: string;
  architecture: string;
  hardware: HardwareInfo;
  runtime: RuntimeInfo;
}

export interface HardwareInfo {
  processor: string;
  memory: number; // MB
  storage: number; // MB
  network: string[];
  sensors: string[];
  biometrics: string[];
}

export interface RuntimeInfo {
  applicationVersion: string;
  sdkVersion: string;
  frameworks: string[];
  permissions: string[];
  features: string[];
}

export interface DeviceCapabilities {
  offlineSupport: boolean;
  backgroundSync: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  camerAccess: boolean;
  gpsAccess: boolean;
  fileSystem: boolean;
  localStorage: number; // MB
  networkTypes: string[];
  encryptionSupport: string[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  altitude?: number;
  timestamp: Date;
  source: 'gps' | 'network' | 'manual';
  country?: string;
  region?: string;
  city?: string;
}

export interface DeviceSecurity {
  encrypted: boolean;
  encryptionMethod?: string;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  remoteLockEnabled: boolean;
  remoteWipeEnabled: boolean;
  jailbroken: boolean;
  rooted: boolean;
  debuggingEnabled: boolean;
  certificatePinning: boolean;
  trustScore: number; // 0-100
  securityEvents: SecurityEvent[];
}

export interface SecurityEvent {
  timestamp: Date;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionTaken: string;
  resolved: boolean;
}

export interface DeviceSyncSettings {
  enabled: boolean;
  frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  wifiOnly: boolean;
  backgroundSync: boolean;
  dataTypes: string[];
  compressionLevel: number;
  encryptionLevel: string;
  priorities: { [dataType: string]: number };
}

export interface DeviceLimits {
  maxSyncBatch: number;
  maxStorageUsage: number; // MB
  maxBandwidthUsage: number; // MB per day
  maxConcurrentSyncs: number;
  offlineRetentionDays: number;
  maxQueueSize: number;
}

export interface DeviceMetadata {
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  imei?: string;
  macAddress?: string;
  installationId: string;
  firstSeen: Date;
  tags: string[];
  customFields: { [key: string]: any };
}

// Synchronization Monitoring and Analytics
export interface SyncMetrics {
  timestamp: Date;
  period: 'hour' | 'day' | 'week' | 'month';
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  totalDataTransferred: number; // bytes
  averageSessionDuration: number; // seconds
  recordsProcessed: number;
  conflictsResolved: number;
  errorRate: number; // percentage
  throughput: number; // records per second
  networkEfficiency: number; // percentage
  storageUtilization: StorageMetrics;
  deviceMetrics: DeviceMetrics;
  userMetrics: UserMetrics;
}

export interface StorageMetrics {
  totalUsed: number; // bytes
  totalAvailable: number; // bytes
  utilizationRate: number; // percentage
  growthRate: number; // bytes per day
  cleanupFrequency: number; // times per period
  compressionRatio: number; // percentage
}

export interface DeviceMetrics {
  activeDevices: number;
  newDevices: number;
  inactiveDevices: number;
  deviceTypes: { [type: string]: number };
  platforms: { [platform: string]: number };
  averageDeviceAge: number; // days
  securityScore: number; // 0-100
}

export interface UserMetrics {
  activeUsers: number;
  syncingUsers: number;
  offlineUsers: number;
  averageSessionsPerUser: number;
  userEngagement: number; // percentage
  troubleTickets: number;
}

export interface SyncHealthCheck {
  timestamp: Date;
  overallHealth: 'healthy' | 'warning' | 'critical' | 'down';
  components: ComponentHealth[];
  performance: PerformanceHealth;
  alerts: HealthAlert[];
  recommendations: string[];
  lastChecked: Date;
  nextCheck: Date;
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'down';
  metrics: { [metric: string]: number };
  thresholds: { [metric: string]: HealthThreshold };
  lastUpdated: Date;
  issues: string[];
}

export interface HealthThreshold {
  warning: number;
  critical: number;
  unit: string;
}

export interface PerformanceHealth {
  responseTime: number; // milliseconds
  throughput: number; // requests per second
  errorRate: number; // percentage
  availability: number; // percentage
  latency: LatencyMetrics;
  capacity: CapacityMetrics;
}

export interface LatencyMetrics {
  p50: number; // milliseconds
  p90: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
}

export interface CapacityMetrics {
  currentLoad: number; // percentage
  peakLoad: number; // percentage
  averageLoad: number; // percentage
  headroom: number; // percentage
  bottlenecks: string[];
}

export interface HealthAlert {
  id: string;
  type: 'performance' | 'availability' | 'security' | 'capacity' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  component: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  actions: string[];
}