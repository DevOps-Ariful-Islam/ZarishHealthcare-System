// Analytics and Reporting Types

export interface ReportMetric {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'operational' | 'financial' | 'quality' | 'performance';
  dataType: 'number' | 'percentage' | 'ratio' | 'count' | 'duration';
  value: number;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  target?: number;
  threshold?: MetricThreshold;
  calculationMethod: string;
  dataSource: string;
  lastUpdated: Date;
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  owner: string;
  tags: string[];
}

export interface MetricThreshold {
  warning: number;
  critical: number;
  optimal?: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'clinical' | 'operational' | 'program' | 'financial';
  owner: string;
  visibility: 'public' | 'private' | 'restricted';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // minutes
  lastRefresh: Date;
  createdDate: Date;
  lastModified: Date;
  accessPermissions: string[];
  tags: string[];
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: 'small' | 'medium' | 'large';
  responsive: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric_card' | 'gauge' | 'map' | 'text' | 'image';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  dataSource: DataSource;
  refreshRate: number; // minutes
  lastRefresh: Date;
  status: 'active' | 'error' | 'loading' | 'disabled';
  errorMessage?: string;
}

export interface WidgetPosition {
  row: number;
  column: number;
  zIndex?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfiguration {
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'treemap';
  colors?: string[];
  showLegend?: boolean;
  showAxes?: boolean;
  showTooltips?: boolean;
  animation?: boolean;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  timeRange?: TimeRange;
  filters?: { [key: string]: any };
  sorting?: SortConfiguration[];
  pagination?: PaginationConfig;
  customOptions?: { [key: string]: any };
}

export interface SortConfiguration {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface PaginationConfig {
  pageSize: number;
  showPagination: boolean;
  showPageSize: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'real_time' | 'calculated';
  connection: DataConnection;
  query: DataQuery;
  caching: CachingConfig;
  security: DataSecurityConfig;
}

export interface DataConnection {
  provider: 'postgresql' | 'mysql' | 'mongodb' | 'rest_api' | 'graphql' | 'file_system';
  connectionString?: string;
  endpoint?: string;
  authentication: AuthenticationConfig;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth' | 'api_key';
  credentials?: { [key: string]: string };
  tokenEndpoint?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

export interface DataQuery {
  query: string;
  parameters?: { [key: string]: any };
  resultLimit?: number;
  timeout?: number;
  cacheable: boolean;
  cacheExpiry?: number; // minutes
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number; // time to live in minutes
  strategy: 'memory' | 'redis' | 'database';
  invalidationTriggers: string[];
}

export interface DataSecurityConfig {
  encryption: boolean;
  anonymization: boolean;
  accessControl: string[];
  auditLogging: boolean;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'dropdown' | 'multiselect' | 'daterange' | 'search' | 'slider' | 'checkbox';
  field: string;
  values: FilterValue[];
  defaultValue?: any;
  required: boolean;
  cascading: CascadingFilter[];
  position: 'top' | 'left' | 'right' | 'bottom';
}

export interface FilterValue {
  label: string;
  value: any;
  count?: number;
  selected: boolean;
}

export interface CascadingFilter {
  parentFilter: string;
  dependentField: string;
  condition: string;
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  start?: Date;
  end?: Date;
  period?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'last_year' | 'ytd' | 'mtd';
  customPeriod?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  };
}

// 4W Reporting System
export interface FourWReport {
  id: string;
  reportingPeriod: ReportingPeriod;
  facility: FacilityInfo;
  organization: OrganizationInfo;
  services: ServiceReport[];
  indicators: IndicatorReport[];
  demographics: DemographicReport;
  challenges: string[];
  achievements: string[];
  plans: string[];
  submissionInfo: SubmissionInfo;
  validationStatus: ValidationStatus;
  approvalWorkflow: ApprovalWorkflow;
}

export interface ReportingPeriod {
  type: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate: Date;
  year: number;
  period: string; // e.g., "2024-Q1", "2024-03", "2024-W12"
  reportingDeadline: Date;
}

export interface FacilityInfo {
  facilityId: string;
  facilityName: string;
  facilityCode: string;
  facilityType: string;
  location: string;
  coordinates?: GeoPoint;
  herams_id?: string;
  operational_status: 'fully_operational' | 'partially_operational' | 'non_operational';
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface OrganizationInfo {
  organizationId: string;
  organizationName: string;
  organizationType: string;
  implementingPartners: string[];
  donors: string[];
  contactPerson: ContactInfo;
}

export interface ContactInfo {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface ServiceReport {
  serviceCategory: string;
  serviceName: string;
  serviceAvailable: boolean;
  serviceLevel: 'basic' | 'comprehensive' | 'specialized';
  staff: StaffReport[];
  equipment: EquipmentReport[];
  supplies: SupplyReport[];
  utilization: ServiceUtilization;
}

export interface StaffReport {
  category: 'doctor' | 'nurse' | 'midwife' | 'technician' | 'support' | 'other';
  planned: number;
  available: number;
  trained: number;
  gender_breakdown: {
    male: number;
    female: number;
  };
}

export interface EquipmentReport {
  equipmentType: string;
  available: number;
  functional: number;
  needs_maintenance: number;
  broken: number;
}

export interface SupplyReport {
  supplyCategory: string;
  adequateStock: boolean;
  daysOfStock: number;
  stockoutItems: string[];
  expiryItems: string[];
}

export interface ServiceUtilization {
  capacity: number;
  utilized: number;
  utilization_rate: number;
  trends: UtilizationTrend[];
}

export interface UtilizationTrend {
  period: string;
  value: number;
  change: number;
  change_type: 'increase' | 'decrease' | 'stable';
}

export interface IndicatorReport {
  indicatorId: string;
  indicatorName: string;
  category: string;
  value: IndicatorValue;
  target?: number;
  previousValue?: number;
  trend: TrendAnalysis;
  disaggregation: DisaggregatedData;
  dataQuality: DataQualityInfo;
  notes?: string;
}

export interface IndicatorValue {
  total: number;
  male?: number;
  female?: number;
  under_5?: number;
  over_5?: number;
  host?: number;
  refugee?: number;
  custom_breakdowns?: { [key: string]: number };
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  rate_of_change: number;
  statistical_significance: boolean;
  seasonal_patterns?: string[];
}

export interface DisaggregatedData {
  by_age: AgeDisaggregation;
  by_gender: GenderDisaggregation;
  by_population: PopulationDisaggregation;
  by_location: LocationDisaggregation[];
  custom_disaggregation?: { [key: string]: any };
}

export interface AgeDisaggregation {
  under_1: number;
  age_1_4: number;
  age_5_17: number;
  age_18_59: number;
  age_60_plus: number;
}

export interface GenderDisaggregation {
  male: number;
  female: number;
  other: number;
  not_specified: number;
}

export interface PopulationDisaggregation {
  refugees: number;
  host_community: number;
  internally_displaced: number;
  returnees: number;
  other: number;
}

export interface LocationDisaggregation {
  location_id: string;
  location_name: string;
  value: number;
  population: number;
  coverage_rate: number;
}

export interface DataQualityInfo {
  completeness: number; // percentage
  accuracy: number; // percentage
  timeliness: number; // percentage
  consistency: number; // percentage
  data_sources: string[];
  validation_methods: string[];
  quality_score: number; // overall score 0-100
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: 'missing_data' | 'inconsistent_data' | 'outlier' | 'duplicate' | 'validation_error';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  resolution_notes?: string;
}

export interface DemographicReport {
  total_population: PopulationData;
  population_by_age: AgeGroupData[];
  population_by_gender: GenderData[];
  vulnerable_groups: VulnerableGroupData[];
  household_data: HouseholdData;
  movement_data?: MovementData;
}

export interface PopulationData {
  total: number;
  refugees: number;
  host_community: number;
  internally_displaced: number;
  returnees: number;
  last_updated: Date;
  data_source: string;
}

export interface AgeGroupData {
  age_group: string;
  male: number;
  female: number;
  total: number;
  percentage: number;
}

export interface GenderData {
  gender: string;
  count: number;
  percentage: number;
}

export interface VulnerableGroupData {
  category: string;
  count: number;
  percentage: number;
  description: string;
  services_needed: string[];
}

export interface HouseholdData {
  total_households: number;
  average_household_size: number;
  female_headed_households: number;
  child_headed_households: number;
  elderly_headed_households: number;
  households_with_disabilities: number;
}

export interface MovementData {
  arrivals: MovementMetrics;
  departures: MovementMetrics;
  internal_movements: MovementMetrics;
  net_change: number;
}

export interface MovementMetrics {
  this_period: number;
  previous_period: number;
  change: number;
  reasons: ReasonData[];
}

export interface ReasonData {
  reason: string;
  count: number;
  percentage: number;
}

export interface SubmissionInfo {
  submittedBy: string;
  submittedDate: Date;
  submissionDeadline: Date;
  late_submission: boolean;
  version: number;
  previous_versions: PreviousVersion[];
  submission_method: 'manual' | 'api' | 'bulk_upload';
  data_format: 'json' | 'xml' | 'excel' | 'csv';
}

export interface PreviousVersion {
  version: number;
  submittedDate: Date;
  submittedBy: string;
  changes_summary: string;
}

export interface ValidationStatus {
  status: 'valid' | 'invalid' | 'pending' | 'warning';
  validation_rules: ValidationRule[];
  validation_results: ValidationResult[];
  overall_score: number;
  critical_errors: number;
  warnings: number;
  validated_by?: string;
  validated_date?: Date;
}

export interface ValidationRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'mandatory' | 'consistency' | 'range' | 'format' | 'business_logic';
  description: string;
  severity: 'error' | 'warning' | 'info';
  automated: boolean;
}

export interface ValidationResult {
  rule_id: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  affected_fields: string[];
  suggested_action?: string;
  auto_correctable: boolean;
}

export interface ApprovalWorkflow {
  workflow_id: string;
  current_step: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_required';
  steps: ApprovalStep[];
  final_approval_date?: Date;
  final_approver?: string;
  rejection_reason?: string;
}

export interface ApprovalStep {
  step_id: string;
  step_name: string;
  approver_role: string;
  approver_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decision_date?: Date;
  comments?: string;
  required: boolean;
  sequence: number;
}

// DHIS2 Integration Types
export interface DHIS2Integration {
  id: string;
  instance_url: string;
  api_version: string;
  authentication: DHIS2Authentication;
  data_sets: DHIS2DataSet[];
  organization_units: DHIS2OrganizationUnit[];
  sync_config: DHIS2SyncConfig;
  last_sync: Date;
  sync_status: 'success' | 'failed' | 'partial' | 'in_progress';
  error_log: DHIS2Error[];
}

export interface DHIS2Authentication {
  username: string;
  password?: string; // encrypted
  oauth_token?: string;
  auth_method: 'basic' | 'oauth';
  token_expiry?: Date;
}

export interface DHIS2DataSet {
  id: string;
  name: string;
  description: string;
  period_type: string;
  data_elements: DHIS2DataElement[];
  mapping: FieldMapping[];
  sync_enabled: boolean;
  last_sync: Date;
}

export interface DHIS2DataElement {
  id: string;
  name: string;
  code: string;
  value_type: string;
  category_combo: string;
  description: string;
}

export interface FieldMapping {
  source_field: string;
  target_element: string;
  transformation_rule?: string;
  validation_rule?: string;
  required: boolean;
}

export interface DHIS2OrganizationUnit {
  id: string;
  name: string;
  code: string;
  level: number;
  parent: string;
  path: string;
  coordinates?: GeoPoint;
  facility_mapping?: string;
}

export interface DHIS2SyncConfig {
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  batch_size: number;
  retry_attempts: number;
  timeout: number;
  data_validation: boolean;
  conflict_resolution: 'overwrite' | 'merge' | 'skip' | 'manual';
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  email_notifications: boolean;
  email_recipients: string[];
  notification_triggers: string[];
  notification_templates: { [key: string]: string };
}

export interface DHIS2Error {
  timestamp: Date;
  error_type: 'authentication' | 'validation' | 'network' | 'data' | 'system';
  error_code: string;
  error_message: string;
  affected_records: string[];
  resolution_status: 'open' | 'in_progress' | 'resolved';
  resolution_notes?: string;
}

// Analytics Calculations
export interface Analytics {
  id: string;
  name: string;
  description: string;
  type: 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';
  data_sources: string[];
  calculations: AnalyticsCalculation[];
  results: AnalyticsResult[];
  schedule: AnalyticsSchedule;
  last_run: Date;
  next_run: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
  owner: string;
  visibility: 'public' | 'private' | 'team';
}

export interface AnalyticsCalculation {
  calculation_id: string;
  name: string;
  formula: string;
  variables: AnalyticsVariable[];
  filters: AnalyticsFilter[];
  grouping: string[];
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median' | 'std_dev';
  time_series: boolean;
  comparison_periods: string[];
}

export interface AnalyticsVariable {
  name: string;
  data_type: 'number' | 'string' | 'date' | 'boolean';
  source: string;
  field: string;
  transformation?: string;
  default_value?: any;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'contains';
  value: any;
  logical_operator?: 'and' | 'or';
}

export interface AnalyticsResult {
  calculation_id: string;
  timestamp: Date;
  period: string;
  dimensions: { [key: string]: string };
  metrics: { [key: string]: number };
  metadata: AnalyticsMetadata;
}

export interface AnalyticsMetadata {
  execution_time: number;
  record_count: number;
  data_quality_score: number;
  confidence_level: number;
  statistical_significance: boolean;
  notes: string[];
}

export interface AnalyticsSchedule {
  enabled: boolean;
  frequency: 'on_demand' | 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  specific_time?: string;
  timezone: string;
  dependencies: string[];
  notifications: boolean;
  retention_days: number;
}

// Performance Monitoring
export interface PerformanceIndicator {
  id: string;
  name: string;
  description: string;
  category: 'efficiency' | 'effectiveness' | 'quality' | 'access' | 'equity';
  level: 'system' | 'facility' | 'service' | 'provider' | 'program';
  calculation: IndicatorCalculation;
  targets: PerformanceTarget[];
  benchmarks: Benchmark[];
  monitoring: MonitoringConfig;
  alerts: AlertConfig[];
  history: PerformanceHistory[];
}

export interface IndicatorCalculation {
  numerator: string;
  denominator?: string;
  formula: string;
  data_sources: string[];
  frequency: string;
  aggregation_level: string[];
  exclusion_criteria?: string[];
}

export interface PerformanceTarget {
  target_id: string;
  period: string;
  value: number;
  threshold_type: 'minimum' | 'maximum' | 'range';
  baseline?: number;
  justification: string;
  set_by: string;
  set_date: Date;
}

export interface Benchmark {
  benchmark_id: string;
  name: string;
  value: number;
  source: string;
  context: string;
  date: Date;
  applicable: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  frequency: string;
  responsible_party: string;
  escalation_rules: EscalationRule[];
  reporting_levels: string[];
}

export interface EscalationRule {
  trigger_condition: string;
  escalation_level: 'warning' | 'critical' | 'emergency';
  notification_delay: number;
  recipients: string[];
  actions: string[];
}

export interface AlertConfig {
  alert_id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notification_channels: string[];
  suppression_rules: SuppressionRule[];
}

export interface SuppressionRule {
  condition: string;
  duration: number;
  max_alerts: number;
}

export interface PerformanceHistory {
  period: string;
  value: number;
  target: number;
  variance: number;
  status: 'above_target' | 'on_target' | 'below_target' | 'critical';
  context_factors: string[];
  corrective_actions: string[];
}