// Authentication and Authorization Types

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  preferredLanguage: string;
  timezone: string;
  lastLogin?: Date;
  lastActivity?: Date;
  loginAttempts: number;
  lockoutUntil?: Date;
  passwordLastChanged: Date;
  mustChangePassword: boolean;
  profile: UserProfile;
  settings: UserSettings;
  roles: Role[];
  permissions: Permission[];
  organizationMemberships: OrganizationMembership[];
  facilityAccess: FacilityAccess[];
  metadata: UserMetadata;
  createdDate: Date;
  lastUpdated: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserProfile {
  profession?: 'doctor' | 'nurse' | 'midwife' | 'lab_technician' | 'pharmacist' | 'administrator' | 'data_manager' | 'field_worker';
  specialization?: string[];
  licenseNumber?: string;
  qualifications: Qualification[];
  experience: ExperienceRecord[];
  languages: LanguageProficiency[];
  emergencyContact?: EmergencyContact;
  address?: Address;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
  identification: IdentificationDocument[];
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  country: string;
  verified: boolean;
  certificateUrl?: string;
}

export interface ExperienceRecord {
  organization: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  location: string;
  verified: boolean;
}

export interface LanguageProficiency {
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
  speaking: boolean;
  reading: boolean;
  writing: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: GeoPoint;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface IdentificationDocument {
  type: 'passport' | 'national_id' | 'driver_license' | 'work_permit' | 'other';
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  verified: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  sms: SMSNotificationSettings;
  inApp: InAppNotificationSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: string[];
  digestEnabled: boolean;
  digestTime: string;
}

export interface PushNotificationSettings {
  enabled: boolean;
  types: string[];
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface SMSNotificationSettings {
  enabled: boolean;
  emergencyOnly: boolean;
  types: string[];
}

export interface InAppNotificationSettings {
  enabled: boolean;
  showBadges: boolean;
  playSound: boolean;
  types: string[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'organization' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  dataProcessingConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  dataRetentionDays: number;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
}

export interface DashboardSettings {
  defaultDashboard: string;
  widgetLayout: { [key: string]: any };
  refreshInterval: number;
  autoRefresh: boolean;
  compactView: boolean;
}

export interface UserMetadata {
  source: 'manual' | 'import' | 'api' | 'sync';
  importId?: string;
  externalId?: string;
  tags: string[];
  customFields: { [key: string]: any };
  notes?: string;
  flags: UserFlag[];
}

export interface UserFlag {
  type: 'warning' | 'info' | 'security' | 'system';
  message: string;
  createdDate: Date;
  expiryDate?: Date;
  acknowledged: boolean;
}

// Role and Permission System
export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'organization' | 'custom';
  level: 'global' | 'organization' | 'facility' | 'program';
  scope: RoleScope;
  permissions: Permission[];
  inheritsFrom?: string[];
  hierarchy: RoleHierarchy;
  constraints: RoleConstraint[];
  active: boolean;
  createdDate: Date;
  lastUpdated: Date;
  createdBy: string;
  assignedUsers: string[];
  metadata: RoleMetadata;
}

export interface RoleScope {
  organizations?: string[];
  facilities?: string[];
  programs?: string[];
  dataTypes?: string[];
  geographicAreas?: string[];
  timeRestrictions?: TimeRestriction;
}

export interface TimeRestriction {
  validFrom?: Date;
  validUntil?: Date;
  daysOfWeek?: number[];
  hoursOfDay?: TimeRange[];
  timeZone: string;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;
}

export interface RoleHierarchy {
  level: number;
  parentRoles: string[];
  childRoles: string[];
  canDelegate: boolean;
  maxDelegationLevel: number;
}

export interface RoleConstraint {
  type: 'mutual_exclusion' | 'prerequisite' | 'cardinality' | 'separation_of_duty';
  description: string;
  rules: string[];
  enforcement: 'strict' | 'warning' | 'audit_only';
}

export interface RoleMetadata {
  category: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceRequired: boolean;
  auditRequired: boolean;
  certificationRequired: boolean;
  customFields: { [key: string]: any };
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  conditions: PermissionCondition[];
  effect: 'allow' | 'deny';
  priority: number;
  context: PermissionContext;
  constraints: PermissionConstraint[];
  audit: AuditRequirement;
  metadata: PermissionMetadata;
}

export interface PermissionAction {
  type: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'export' | 'import';
  operations: string[];
  granularity: 'all' | 'own' | 'organization' | 'facility' | 'program';
}

export interface PermissionScope {
  resources: string[];
  attributes: string[];
  filters: { [key: string]: any };
  exclusions: string[];
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'context' | 'attribute' | 'relationship';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  field: string;
}

export interface PermissionContext {
  environment: 'production' | 'staging' | 'development';
  clientTypes: string[];
  ipRestrictions: string[];
  deviceRestrictions: string[];
  locationRestrictions: string[];
}

export interface PermissionConstraint {
  type: 'rate_limit' | 'concurrent_session' | 'time_window' | 'approval_required';
  parameters: { [key: string]: any };
  enforcement: 'strict' | 'soft' | 'warning';
}

export interface AuditRequirement {
  required: boolean;
  level: 'access' | 'modification' | 'full';
  retention: number; // days
  realTime: boolean;
  alerting: boolean;
}

export interface PermissionMetadata {
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceStandards: string[];
  businessJustification: string;
  lastReviewed: Date;
  reviewFrequency: number; // days
}

// Organization Membership
export interface OrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate: Date;
  endDate?: Date;
  roles: string[];
  department?: string;
  position?: string;
  manager?: string;
  directReports: string[];
  accessLevel: 'full' | 'limited' | 'read_only';
  permissions: OrganizationPermission[];
  delegation: DelegationSettings;
  metadata: MembershipMetadata;
}

export interface OrganizationPermission {
  resource: string;
  actions: string[];
  scope: string[];
  conditions: { [key: string]: any };
}

export interface DelegationSettings {
  canDelegate: boolean;
  maxDelegationLevel: number;
  delegatedPermissions: string[];
  currentDelegations: Delegation[];
}

export interface Delegation {
  id: string;
  delegatedTo: string;
  permissions: string[];
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  constraints: { [key: string]: any };
}

export interface MembershipMetadata {
  employeeId?: string;
  costCenter?: string;
  budgetCode?: string;
  contractType: 'permanent' | 'temporary' | 'consultant' | 'volunteer';
  securityClearance?: string;
  customFields: { [key: string]: any };
}

// Facility Access
export interface FacilityAccess {
  id: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  accessType: 'full' | 'limited' | 'emergency_only' | 'read_only';
  accessLevel: 'administrator' | 'supervisor' | 'user' | 'viewer';
  grantedDate: Date;
  expiryDate?: Date;
  grantedBy: string;
  reason: string;
  services: ServiceAccess[];
  schedules: AccessSchedule[];
  restrictions: AccessRestriction[];
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  lastUsed?: Date;
  usageCount: number;
}

export interface ServiceAccess {
  serviceId: string;
  serviceName: string;
  accessLevel: 'full' | 'limited' | 'read_only';
  permissions: string[];
  restrictions: string[];
}

export interface AccessSchedule {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
  exceptions: ScheduleException[];
}

export interface ScheduleException {
  date: Date;
  type: 'block' | 'allow';
  reason: string;
  startTime?: string;
  endTime?: string;
}

export interface AccessRestriction {
  type: 'ip_address' | 'device' | 'location' | 'time' | 'concurrent_sessions';
  values: string[];
  enforcement: 'strict' | 'warning';
  message?: string;
}

// Authentication Token Types
export interface AuthToken {
  id: string;
  type: 'access_token' | 'refresh_token' | 'api_key' | 'session_token';
  userId: string;
  token: string; // encrypted/hashed
  scope: string[];
  permissions: string[];
  issuedAt: Date;
  expiresAt: Date;
  lastUsed?: Date;
  usageCount: number;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
  metadata: TokenMetadata;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'server' | 'unknown';
  platform: string;
  browser?: string;
  operatingSystem: string;
  trusted: boolean;
  registered: boolean;
  fingerprint: string;
}

export interface TokenMetadata {
  purpose: string;
  clientId?: string;
  applicationName?: string;
  requestedScopes: string[];
  grantedScopes: string[];
  refreshable: boolean;
  renewable: boolean;
  customClaims: { [key: string]: any };
}

// Authentication Session
export interface AuthSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  startTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'terminated' | 'suspicious';
  activities: SessionActivity[];
  location: SessionLocation;
  security: SessionSecurity;
  preferences: SessionPreferences;
}

export interface SessionActivity {
  timestamp: Date;
  action: string;
  resource?: string;
  result: 'success' | 'failure' | 'warning';
  details: { [key: string]: any };
  ipAddress: string;
  userAgent: string;
}

export interface SessionLocation {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: GeoPoint;
  timezone: string;
  accuracy: 'high' | 'medium' | 'low';
  source: 'gps' | 'ip' | 'manual' | 'unknown';
}

export interface SessionSecurity {
  riskScore: number; // 0-100
  riskFactors: string[];
  mfaVerified: boolean;
  deviceTrusted: boolean;
  anomaliesDetected: boolean;
  securityEvents: SecurityEvent[];
}

export interface SecurityEvent {
  timestamp: Date;
  type: 'login_success' | 'login_failure' | 'password_change' | 'mfa_challenge' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action_taken: string;
  resolved: boolean;
}

export interface SessionPreferences {
  language: string;
  timezone: string;
  theme: string;
  notifications: boolean;
  autoLogout: number; // minutes
  rememberMe: boolean;
}

// Multi-Factor Authentication
export interface MFAConfig {
  enabled: boolean;
  required: boolean;
  methods: MFAMethod[];
  backupCodes: string[];
  trustedDevices: TrustedDevice[];
  settings: MFASettings;
}

export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'push' | 'hardware_key' | 'biometric';
  name: string;
  enabled: boolean;
  verified: boolean;
  primary: boolean;
  setupDate: Date;
  lastUsed?: Date;
  usageCount: number;
  configuration: MFAMethodConfig;
}

export interface MFAMethodConfig {
  // TOTP specific
  secret?: string;
  qrCode?: string;
  
  // SMS/Email specific
  phoneNumber?: string;
  email?: string;
  
  // Push specific
  deviceId?: string;
  publicKey?: string;
  
  // Hardware key specific
  keyId?: string;
  algorithm?: string;
  
  // Biometric specific
  biometricType?: 'fingerprint' | 'face' | 'voice' | 'iris';
  templateHash?: string;
}

export interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  fingerprint: string;
  trustedAt: Date;
  expiresAt?: Date;
  lastSeen: Date;
  ipAddress: string;
  location?: string;
  userAgent: string;
}

export interface MFASettings {
  gracePeriod: number; // hours
  rememberDevice: boolean;
  deviceTrustDuration: number; // days
  maxBackupCodes: number;
  requireForApiAccess: boolean;
  requireForPasswordReset: boolean;
  emergencyBypass: boolean;
}

// OAuth and External Authentication
export interface OAuthProvider {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'facebook' | 'github' | 'custom';
  clientId: string;
  clientSecret: string; // encrypted
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
  enabled: boolean;
  configuration: OAuthConfiguration;
  mapping: AttributeMapping;
  security: OAuthSecurity;
}

export interface OAuthConfiguration {
  responseType: string;
  grantType: string;
  accessType: 'offline' | 'online';
  prompt: string;
  pkce: boolean;
  state: boolean;
  nonce: boolean;
  customParameters: { [key: string]: string };
}

export interface AttributeMapping {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  customMappings: { [key: string]: string };
}

export interface OAuthSecurity {
  validateIssuer: boolean;
  validateAudience: boolean;
  clockSkew: number;
  jwksUri: string;
  trustUnverifiedCerts: boolean;
  encryptTokens: boolean;
}

// API Keys and Service Authentication
export interface APIKey {
  id: string;
  name: string;
  description: string;
  keyHash: string;
  keyPrefix: string;
  userId?: string;
  serviceAccountId?: string;
  scope: string[];
  permissions: string[];
  rateLimit: RateLimit;
  ipWhitelist: string[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  createdDate: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageStats: APIKeyUsage;
  rotation: KeyRotation;
}

export interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day';
  burst: number;
  enforcement: 'strict' | 'soft' | 'warning_only';
}

export interface APIKeyUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestTime?: Date;
  averageResponseTime: number;
  rateLimitHits: number;
  ipAddresses: string[];
}

export interface KeyRotation {
  enabled: boolean;
  frequency: number; // days
  lastRotated?: Date;
  nextRotation?: Date;
  gracePeriod: number; // days
  autoRotate: boolean;
  notifyBefore: number; // days
}

// Audit and Compliance
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  location?: GeoPoint;
  details: AuditDetails;
  risk_score: number;
  compliance_flags: string[];
  metadata: { [key: string]: any };
}

export interface AuditDetails {
  method?: string;
  endpoint?: string;
  requestSize?: number;
  responseSize?: number;
  duration?: number;
  errorCode?: string;
  errorMessage?: string;
  changes?: DataChange[];
  businessContext?: { [key: string]: any };
}

export interface DataChange {
  field: string;
  oldValue?: any;
  newValue?: any;
  action: 'create' | 'update' | 'delete';
  sensitive: boolean;
}

export interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'hipaa' | 'sox' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: ComplianceMetric[];
  violations: ComplianceViolation[];
  recommendations: string[];
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  generatedDate: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface ComplianceMetric {
  name: string;
  value: number;
  target: number;
  status: 'pass' | 'fail' | 'warning';
  trend: 'improving' | 'stable' | 'declining';
  details: string;
}

export interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  affectedData: string[];
  detectedDate: Date;
  resolvedDate?: Date;
  resolution?: string;
  preventionMeasures: string[];
}