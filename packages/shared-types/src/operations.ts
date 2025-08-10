// Operations Management Types

export interface Organization {
  id: string;
  name: string;
  type: 'implementing_partner' | 'donor' | 'government' | 'un_agency' | 'ngo_local' | 'ngo_international';
  acronym?: string;
  country: string;
  address: Address;
  contactInfo: OrganizationContact;
  registrationInfo: RegistrationInfo;
  partnerships: Partnership[];
  operationalAreas: OperationalArea[];
  capacity: OrganizationCapacity;
  certification: Certification[];
  active: boolean;
  createdDate: Date;
  lastUpdated: Date;
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

export interface OrganizationContact {
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  website?: string;
  focalPerson: ContactPerson[];
}

export interface ContactPerson {
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  isPrimary: boolean;
}

export interface RegistrationInfo {
  registrationNumber: string;
  registrationDate: Date;
  registrationAuthority: string;
  taxId?: string;
  legalStatus: 'registered' | 'pending' | 'expired' | 'suspended';
  licenses: License[];
}

export interface License {
  type: string;
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
}

export interface Partnership {
  partnerId: string;
  partnerName: string;
  partnershipType: 'donor' | 'implementing' | 'coordination' | 'technical' | 'supply';
  startDate: Date;
  endDate?: Date;
  agreementReference: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  roles: string[];
  responsibilities: string[];
}

export interface OperationalArea {
  id: string;
  name: string;
  type: 'camp' | 'district' | 'region' | 'country';
  code: string;
  parentArea?: string;
  population?: PopulationData;
  facilities: string[]; // facility IDs
  programs: string[]; // program IDs
  coordinates: GeographicBounds;
}

export interface PopulationData {
  total: number;
  byDemographic: DemographicBreakdown;
  lastUpdated: Date;
  source: string;
}

export interface DemographicBreakdown {
  male: number;
  female: number;
  children_under5: number;
  children_5to17: number;
  adults_18to59: number;
  elderly_60plus: number;
  rohingya?: number;
  host?: number;
}

export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface OrganizationCapacity {
  staffCount: StaffCapacity;
  technicalExpertise: string[];
  languages: string[];
  equipmentInventory: EquipmentCapacity[];
  budget: BudgetCapacity;
  certifications: string[];
}

export interface StaffCapacity {
  total: number;
  byCategory: {
    medical: number;
    nursing: number;
    administrative: number;
    technical: number;
    support: number;
  };
  byLocation: LocationStaffing[];
}

export interface LocationStaffing {
  location: string;
  staffCount: number;
  positions: StaffPosition[];
}

export interface StaffPosition {
  position: string;
  filled: number;
  vacant: number;
  required: number;
}

export interface EquipmentCapacity {
  category: string;
  items: EquipmentItem[];
  totalValue: number;
  maintenanceStatus: 'good' | 'fair' | 'poor';
}

export interface EquipmentItem {
  name: string;
  quantity: number;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'broken';
  value: number;
}

export interface BudgetCapacity {
  totalBudget: number;
  availableFunding: number;
  byDonor: DonorFunding[];
  byProgram: ProgramBudget[];
  currency: string;
  fiscalYear: string;
}

export interface DonorFunding {
  donor: string;
  amount: number;
  committed: number;
  disbursed: number;
  conditions: string[];
}

export interface ProgramBudget {
  program: string;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  burnRate: number;
}

export interface Certification {
  type: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  scope: string;
  certificateNumber: string;
}

// Resource Management
export interface Resource {
  id: string;
  name: string;
  type: 'human' | 'financial' | 'material' | 'equipment' | 'infrastructure';
  category: string;
  description: string;
  owner: string; // organization ID
  location: string;
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
  capacity: ResourceCapacity;
  allocation: ResourceAllocation[];
  maintenanceSchedule?: MaintenanceSchedule;
  cost: ResourceCost;
  lastUpdated: Date;
}

export interface ResourceCapacity {
  total: number;
  available: number;
  allocated: number;
  unit: string;
  utilizationRate: number;
}

export interface ResourceAllocation {
  allocationId: string;
  allocatedTo: string; // project, program, or activity ID
  allocatedBy: string; // user ID
  startDate: Date;
  endDate: Date;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MaintenanceSchedule {
  scheduleId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  assignedTo: string;
  estimatedDuration: number; // hours
  cost: number;
}

export interface ResourceCost {
  acquisitionCost: number;
  maintenanceCost: number;
  operationalCost: number;
  totalLifetimeCost: number;
  costPerUnit: number;
  currency: string;
  lastUpdated: Date;
}

// Supply Chain Management
export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: 'medical_supplies' | 'pharmaceuticals' | 'equipment' | 'consumables' | 'administrative';
  subCategory: string;
  unit: string;
  manufacturer?: string;
  supplier: string;
  specifications: ItemSpecifications;
  inventory: InventoryLevel[];
  procurement: ProcurementInfo;
  qualityControl: QualityControlInfo;
  distributionHistory: DistributionRecord[];
  expiryTracking?: ExpiryTracking;
}

export interface ItemSpecifications {
  model?: string;
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  technicalSpecs: { [key: string]: string };
  certifications: string[];
  storageRequirements: StorageRequirement[];
}

export interface StorageRequirement {
  parameter: 'temperature' | 'humidity' | 'light' | 'ventilation';
  minValue?: number;
  maxValue?: number;
  unit: string;
  critical: boolean;
}

export interface InventoryLevel {
  locationId: string;
  locationName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  lastStockTake: Date;
  adjustments: StockAdjustment[];
}

export interface StockAdjustment {
  adjustmentId: string;
  date: Date;
  type: 'receipt' | 'issue' | 'transfer' | 'loss' | 'damage' | 'expiry' | 'correction';
  quantity: number;
  reason: string;
  authorizedBy: string;
  documentReference?: string;
}

export interface ProcurementInfo {
  preferredSuppliers: string[];
  leadTime: number; // days
  minimumOrderQuantity: number;
  unitCost: number;
  currency: string;
  contractReference?: string;
  qualificationRequired: boolean;
  importRestrictions: string[];
}

export interface QualityControlInfo {
  inspectionRequired: boolean;
  inspectionCriteria: string[];
  qualityStandards: string[];
  defectRate: number;
  qualityScore: number;
  lastInspection: Date;
  approvedSuppliers: string[];
}

export interface DistributionRecord {
  distributionId: string;
  date: Date;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  requestedBy: string;
  authorizedBy: string;
  transportMethod: string;
  trackingNumber?: string;
  deliveryStatus: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'lost';
  receivedBy?: string;
  receivedDate?: Date;
}

export interface ExpiryTracking {
  batchNumber: string;
  manufactureDate: Date;
  expiryDate: Date;
  shelfLife: number; // months
  daysToExpiry: number;
  expiryStatus: 'fresh' | 'near_expiry' | 'expired';
  disposalRequired: boolean;
  disposalDate?: Date;
}

// Project and Program Management
export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'emergency_response' | 'development' | 'capacity_building' | 'research' | 'advocacy';
  status: 'planned' | 'active' | 'suspended' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  stakeholders: ProjectStakeholder[];
  objectives: ProjectObjective[];
  activities: ProjectActivity[];
  locations: string[];
  beneficiaries: BeneficiaryInfo;
  riskAssessment: RiskAssessment;
  monitoring: MonitoringPlan;
  reporting: ReportingSchedule;
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  phases: ProjectPhase[];
  milestones: Milestone[];
  currentPhase: string;
  percentComplete: number;
}

export interface ProjectPhase {
  phaseId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  deliverables: string[];
  dependencies: string[];
}

export interface Milestone {
  milestoneId: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: 'pending' | 'achieved' | 'overdue' | 'cancelled';
  criticalPath: boolean;
}

export interface ProjectBudget {
  totalBudget: number;
  spentBudget: number;
  commitments: number;
  availableBudget: number;
  currency: string;
  budgetBreakdown: BudgetCategory[];
  fundingSources: FundingSource[];
  variance: BudgetVariance;
}

export interface BudgetCategory {
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  commitments: number;
  variance: number;
  variancePercent: number;
}

export interface FundingSource {
  donor: string;
  amount: number;
  committed: number;
  disbursed: number;
  conditions: string[];
  reportingRequirements: string[];
}

export interface BudgetVariance {
  amount: number;
  percentage: number;
  reasons: string[];
  corrective_actions: string[];
}

export interface ProjectStakeholder {
  stakeholderId: string;
  name: string;
  type: 'beneficiary' | 'partner' | 'donor' | 'government' | 'community' | 'staff';
  role: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  engagement_strategy: string;
  communication_preferences: string[];
  lastEngagement: Date;
}

export interface ProjectObjective {
  objectiveId: string;
  description: string;
  type: 'outcome' | 'output' | 'impact';
  indicators: PerformanceIndicator[];
  targets: Target[];
  status: 'on_track' | 'at_risk' | 'off_track' | 'achieved';
}

export interface PerformanceIndicator {
  indicatorId: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative';
  unit: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  dataSource: string;
  responsible: string;
  baseline: number;
  target: number;
  currentValue: number;
  achievements: Achievement[];
}

export interface Target {
  targetId: string;
  description: string;
  value: number;
  unit: string;
  deadline: Date;
  status: 'not_started' | 'in_progress' | 'achieved' | 'overdue';
}

export interface Achievement {
  date: Date;
  value: number;
  notes: string;
  verifiedBy: string;
}

export interface ProjectActivity {
  activityId: string;
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  startDate: Date;
  endDate: Date;
  duration: number; // days
  responsible: string;
  resources: ActivityResource[];
  prerequisites: string[];
  deliverables: string[];
  progress: ActivityProgress;
}

export interface ActivityResource {
  resourceType: 'human' | 'financial' | 'material';
  resourceName: string;
  quantity: number;
  unit: string;
  cost: number;
  allocation: number; // percentage
}

export interface ActivityProgress {
  percentComplete: number;
  lastUpdate: Date;
  updatedBy: string;
  notes: string;
  issues: string[];
  nextSteps: string[];
}

export interface BeneficiaryInfo {
  totalBeneficiaries: number;
  directBeneficiaries: number;
  indirectBeneficiaries: number;
  demographics: BeneficiaryDemographics;
  targeting: TargetingCriteria;
  enrollment: EnrollmentInfo;
}

export interface BeneficiaryDemographics {
  ageGroups: AgeGroupBreakdown;
  gender: GenderBreakdown;
  populationType: PopulationTypeBreakdown;
  vulnerability: VulnerabilityBreakdown;
}

export interface AgeGroupBreakdown {
  under5: number;
  age5to17: number;
  age18to59: number;
  age60plus: number;
}

export interface GenderBreakdown {
  male: number;
  female: number;
  other: number;
}

export interface PopulationTypeBreakdown {
  refugees: number;
  hostCommunity: number;
  idps: number;
  returnees: number;
}

export interface VulnerabilityBreakdown {
  disabilities: number;
  chronicIllness: number;
  pregnantLactating: number;
  elderlyAlone: number;
  childHeadedHouseholds: number;
}

export interface TargetingCriteria {
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  priorityGroups: string[];
  vulnerabilityWeighting: { [key: string]: number };
}

export interface EnrollmentInfo {
  enrollmentStartDate: Date;
  enrollmentEndDate?: Date;
  enrollmentStatus: 'open' | 'closed' | 'suspended';
  enrolled: number;
  waitingList: number;
  dropouts: number;
  graduations: number;
}

export interface RiskAssessment {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: ProjectRisk[];
  mitigationStrategies: MitigationStrategy[];
  lastUpdate: Date;
  nextReview: Date;
}

export interface ProjectRisk {
  riskId: string;
  category: 'security' | 'financial' | 'operational' | 'political' | 'environmental' | 'technical';
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'mitigated' | 'closed' | 'accepted';
  mitigation: string;
  owner: string;
  reviewDate: Date;
}

export interface MitigationStrategy {
  strategyId: string;
  riskId: string;
  strategy: string;
  actions: string[];
  responsible: string;
  timeline: Date;
  status: 'planned' | 'implementing' | 'completed';
  effectiveness: 'high' | 'medium' | 'low';
}

export interface MonitoringPlan {
  framework: 'logframe' | 'results_chain' | 'theory_of_change';
  indicators: MonitoringIndicator[];
  dataCollection: DataCollectionPlan[];
  reportingSchedule: ReportingFrequency;
  qualityAssurance: QualityAssuranceFramework;
}

export interface MonitoringIndicator {
  indicatorId: string;
  level: 'impact' | 'outcome' | 'output' | 'activity';
  indicator: string;
  definition: string;
  dataSource: string;
  frequency: string;
  responsible: string;
  baseline: string;
  target: string;
  assumptions: string[];
}

export interface DataCollectionPlan {
  dataType: string;
  method: 'survey' | 'interview' | 'observation' | 'document_review' | 'routine_data';
  frequency: string;
  sample: SamplingPlan;
  responsible: string;
  timeline: Date[];
}

export interface SamplingPlan {
  method: 'random' | 'systematic' | 'stratified' | 'cluster' | 'purposive';
  sampleSize: number;
  confidenceLevel: number;
  marginOfError: number;
  strata: string[];
}

export interface ReportingFrequency {
  monthly: boolean;
  quarterly: boolean;
  annually: boolean;
  adhoc: boolean;
  donors: ReportingRequirement[];
}

export interface ReportingRequirement {
  recipient: string;
  frequency: string;
  format: string;
  deadline: string;
  content: string[];
}

export interface QualityAssuranceFramework {
  dataVerification: string;
  validation_methods: string[];
  audit_schedule: string;
  feedback_mechanisms: string[];
  improvement_process: string;
}

export interface ReportingSchedule {
  reports: ScheduledReport[];
  adhocReports: AdhocReport[];
  submissionDeadlines: ReportingDeadline[];
}

export interface ScheduledReport {
  reportId: string;
  name: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  recipients: string[];
  template: string;
  responsible: string;
  lastSubmission: Date;
  nextDue: Date;
  status: 'current' | 'overdue' | 'draft';
}

export interface AdhocReport {
  reportId: string;
  name: string;
  requestedBy: string;
  requestDate: Date;
  dueDate: Date;
  purpose: string;
  responsible: string;
  status: 'requested' | 'in_progress' | 'completed';
}

export interface ReportingDeadline {
  recipient: string;
  reportType: string;
  deadline: Date;
  status: 'upcoming' | 'due' | 'overdue' | 'submitted';
  submittedDate?: Date;
}