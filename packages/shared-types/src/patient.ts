// Patient Management Types
export interface Patient {
  id: string;
  demographics: PatientDemographics;
  medicalHistory: MedicalHistory[];
  registrationDate: Date;
  facilityCode: string;
  activeStatus: boolean;
  syncStatus?: SyncStatus;
}

export interface PatientDemographics {
  name: string;
  age: number;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'diverse';
  populationType: 'rohingya' | 'host';
  campLocation: string;
  blockNumber: string;
  familySize: number;
  contactInfo: ContactInfo;
  emergencyContact?: string;
  languages: string[];
  documentation?: PatientDocumentation;
}

export interface ContactInfo {
  primaryPhone?: string;
  secondaryPhone?: string;
  address: Address;
  nextOfKin?: string;
  nextOfKinRelation?: string;
}

export interface Address {
  camp: string;
  block: string;
  shelterId?: string;
  coordinates?: GeoPoint;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface PatientDocumentation {
  smartCardId?: string;
  unhcrId?: string;
  nationalId?: string;
  birthCertificate?: string;
  photos?: string[];
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  icdCode?: string;
  diagnosisDate: Date;
  currentStatus: 'active' | 'resolved' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe';
  providerNotes: string;
  facility: string;
  provider: string;
}

// Clinical Encounter Types
export interface Consultation {
  id: string;
  patientId: string;
  providerId: string;
  facilityId: string;
  visitDate: Date;
  visitType: 'opd' | 'emergency' | 'follow_up' | 'referral' | 'outreach';
  chiefComplaint: string;
  clinicalNotes: string;
  diagnoses: Diagnosis[];
  treatmentPlan?: TreatmentPlan;
  vitalSigns?: VitalSigns;
  status: 'active' | 'completed' | 'cancelled';
  referral?: Referral;
  followUpDate?: Date;
  syncStatus?: SyncStatus;
}

export interface Diagnosis {
  id: string;
  consultationId: string;
  icdCode: string;
  diagnosisText: string;
  diagnosisType: 'primary' | 'secondary' | 'differential';
  certainty: 'confirmed' | 'suspected' | 'ruled_out';
  providerNotes?: string;
}

export interface TreatmentPlan {
  medications: Medication[];
  procedures: Procedure[];
  recommendations: string[];
  followUpInstructions: string;
  nextAppointment?: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
}

export interface Procedure {
  code: string;
  name: string;
  description: string;
  performedBy: string;
  date: Date;
}

// Specialized Programs
export interface NCDProgram {
  id: string;
  patientId: string;
  conditionType: 'hypertension' | 'diabetes' | 'copd' | 'asthma' | 'epilepsy';
  diagnosisDate: Date;
  currentStatus: 'newly_diagnosed' | 'follow_up' | 'controlled' | 'uncontrolled';
  treatmentProtocol: string;
  lastAssessmentDate: Date;
  nextAppointment?: Date;
  controlStatus: NCDControlStatus;
  medications: Medication[];
  lifestyle: LifestyleFactors;
}

export interface NCDControlStatus {
  bpControlled?: boolean;
  glucoseControlled?: boolean;
  lastHbA1c?: number;
  lastBP?: BloodPressure;
  targetAchieved: boolean;
  lastAssessment: Date;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  pulse: number;
  date: Date;
}

export interface LifestyleFactors {
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'never' | 'occasional' | 'regular' | 'heavy';
  dietaryHabits: string;
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active';
  stressLevel: 'low' | 'moderate' | 'high';
}

export interface MentalHealthCase {
  id: string;
  patientId: string;
  caseType: 'new_clinical' | 'follow_up_clinical' | 'counseling';
  providerType: 'psychiatrist' | 'mhgap_doctor' | 'psychologist' | 'counselor';
  sessionDate: Date;
  sessionType: 'individual' | 'group' | 'family';
  assessmentTools: string[];
  treatmentPlan: string;
  followUpRequired: boolean;
  riskLevel: 'low' | 'moderate' | 'high' | 'crisis';
  interventions: MHIntervention[];
}

export interface MHIntervention {
  type: 'medication' | 'therapy' | 'counseling' | 'referral';
  description: string;
  provider: string;
  date: Date;
  outcome?: string;
}

export interface MaternalHealth {
  id: string;
  patientId: string;
  pregnancyStatus: 'pregnant' | 'postpartum' | 'family_planning';
  ancVisits: ANCVisit[];
  pncVisits: PNCVisit[];
  familyPlanning?: FamilyPlanningMethod;
  estimatedDueDate?: Date;
  pregnancyComplications: string[];
  deliveryInfo?: DeliveryInfo;
}

export interface ANCVisit {
  visitNumber: number;
  date: Date;
  gestationalAge: number;
  weight: number;
  bloodPressure: BloodPressure;
  complications: string[];
  medications: Medication[];
  nextVisitDate: Date;
}

export interface PNCVisit {
  visitNumber: number;
  date: Date;
  postpartumDay: number;
  weight: number;
  bloodPressure: BloodPressure;
  complications: string[];
  breastfeedingStatus: string;
  familyPlanningCounseling: boolean;
}

export interface FamilyPlanningMethod {
  method: 'iud' | 'implant' | 'injectable' | 'pill' | 'condom' | 'natural';
  startDate: Date;
  provider: string;
  counselingProvided: boolean;
  followUpDate?: Date;
}

export interface DeliveryInfo {
  deliveryDate: Date;
  deliveryType: 'normal_vaginal' | 'assisted' | 'cesarean';
  attendant: string;
  facility: string;
  complications: string[];
  birthWeight: number;
  apgarScore?: number;
}

// Referral System
export interface Referral {
  id: string;
  patientId: string;
  referringProvider: string;
  referringFacility: string;
  referredToFacility: string;
  referralDate: Date;
  referralReason: string;
  urgency: 'emergency' | 'elective';
  clinicalSummary: string;
  referralStatus: 'pending' | 'accepted' | 'completed' | 'rejected';
  followUpReceived: boolean;
  transportArranged?: boolean;
  accompaniedBy?: string;
}

// Healthcare Facility & Provider Types
export interface HealthcareFacility {
  id: string;
  facilityName: string;
  facilityCode: string;
  facilityType: 'phc' | 'shc' | 'field_hospital' | 'mobile_clinic';
  location: Address;
  servicesOffered: string[];
  operatingHours: OperatingHours;
  heramsRegistered: boolean;
  partnerOrganization: string;
  capacity: FacilityCapacity;
  equipment: EquipmentInventory[];
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface FacilityCapacity {
  opdConsultations: number;
  bedCapacity: number;
  laboratoryTests: number;
  surgicalProcedures: number;
}

export interface EquipmentInventory {
  equipmentId: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'broken';
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  profession: 'doctor' | 'nurse' | 'midwife' | 'chw' | 'counselor' | 'lab_tech';
  qualifications: string[];
  specializations: string[];
  facilityId: string;
  employmentStatus: 'full_time' | 'part_time' | 'volunteer';
  trainingRecords: TrainingRecord[];
  licenseNumber?: string;
  contactInfo: ContactInfo;
}

export interface TrainingRecord {
  trainingId: string;
  trainingName: string;
  trainingType: 'mhgap' | 'mhpss' | 'ncd' | 'maternal_health' | 'laboratory' | 'other';
  completionDate: Date;
  certificateNumber?: string;
  validUntil?: Date;
  trainingProvider: string;
}

// Surveillance Types
export interface EWARSCase {
  id: string;
  patientId: string;
  diseaseCode: string;
  diseaseName: string;
  caseDate: Date;
  ageGroup: 'under_5' | 'over_5';
  gender: 'male' | 'female';
  caseClassification: 'suspected' | 'confirmed';
  reportingWeek: number;
  reportingYear: number;
  facilityId: string;
  reportedBy: string;
}

export interface FourWReporting {
  id: string;
  reportingPeriod: string;
  facilityId: string;
  partnerOrganization: string;
  serviceCategory: string;
  indicatorName: string;
  valueTotal: number;
  valueMale: number;
  valueFemale: number;
  valueHost: number;
  valueRohingya: number;
  valueUnder5: number;
  submissionDate: Date;
  submittedBy: string;
}

// Common sync status type
export interface SyncStatus {
  lastSync: Date;
  syncVersion: number;
  conflicts?: string[];
  status: 'synced' | 'pending' | 'conflict' | 'error';
}