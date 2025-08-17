// ZarishHealthcare System - Shared Types
// Export core types with namespace prefixes to avoid conflicts

// Common utility types
export * from './common';

// Domain-specific modules (use named imports to avoid conflicts)
export * as PatientTypes from './patient';
export * as ClinicalTypes from './clinical';  
export * as LaboratoryTypes from './laboratory';
export * as OperationsTypes from './operations';
export * as AnalyticsTypes from './analytics';
export * as AuthTypes from './auth';
export * as SyncTypes from './sync';

// Re-export most commonly used types directly
export type {
  Patient,
  Consultation,
  NCDProgram,
  MentalHealthCase,
  HealthcareFacility,
  HealthcareProvider
} from './patient';

export type {
  User,
  Role,
  Permission,
  AuthToken
} from './auth';

export type {
  SyncStatus
} from './sync';

export type {
  ApiResponse,
  PaginationRequest,
  BaseEntity
} from './common';