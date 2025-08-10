// Laboratory Information Management Types

export interface LabOrder {
  id: string;
  consultationId: string;
  patientId: string;
  orderedBy: string; // provider_id
  orderDate: Date;
  testsRequested: LabTest[];
  priority: 'routine' | 'urgent' | 'stat';
  clinicalIndication: string;
  status: 'ordered' | 'collected' | 'in_progress' | 'completed' | 'cancelled';
  collectionDate?: Date;
  collectedBy?: string;
  specimenInfo: SpecimenInfo[];
  results?: LabResult[];
  reportDate?: Date;
  reportedBy?: string;
  syncStatus?: SyncStatus;
}

export interface LabTest {
  id: string;
  orderId: string;
  testCode: string;
  testName: string;
  testCategory: 'hematology' | 'biochemistry' | 'microbiology' | 'immunology' | 'parasitology' | 'rdt';
  specimenType: 'blood' | 'urine' | 'stool' | 'sputum' | 'csf' | 'other';
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  result?: TestResult;
  performedDate?: Date;
  performedBy?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface SpecimenInfo {
  specimenId: string;
  specimenType: 'blood' | 'urine' | 'stool' | 'sputum' | 'csf' | 'tissue' | 'swab' | 'other';
  collectionMethod: string;
  collectionSite?: string;
  collectionDate: Date;
  collectedBy: string;
  volume?: number;
  qualityAssessment: SpecimenQuality;
  storageConditions: string;
  transportConditions: string;
  receivedDate?: Date;
  receivedBy?: string;
}

export interface SpecimenQuality {
  adequate: boolean;
  issues: string[];
  appearance: string;
  contamination: boolean;
  hemolysis?: boolean;
  clotted?: boolean;
}

export interface TestResult {
  value: string;
  numericValue?: number;
  unit?: string;
  referenceRange: string;
  abnormalFlag: 'low' | 'high' | 'critical_low' | 'critical_high' | 'normal' | 'abnormal';
  interpretation?: string;
  method: string;
  instrument?: string;
  comments?: string;
}

export interface LabResult {
  id: string;
  orderId: string;
  testId: string;
  patientId: string;
  testName: string;
  result: TestResult;
  performedDate: Date;
  performedBy: string;
  verifiedDate: Date;
  verifiedBy: string;
  reportedDate: Date;
  criticalValue: boolean;
  criticalNotified: boolean;
  qualityControl: QualityControlResult;
}

export interface QualityControlResult {
  controlLevel: 'low' | 'normal' | 'high';
  expectedValue: number;
  actualValue: number;
  withinLimits: boolean;
  coefficient_of_variation?: number;
  comments?: string;
}

// Rapid Diagnostic Tests (RDT)
export interface RapidDiagnosticTest {
  id: string;
  testId: string;
  testType: 'hepatitis_b' | 'hepatitis_c' | 'hepatitis_e' | 'hiv' | 'syphilis' | 'dengue' | 'malaria' | 'cholera' | 'covid' | 'pregnancy';
  manufacturer: string;
  lotNumber: string;
  expiryDate: Date;
  result: 'positive' | 'negative' | 'invalid' | 'indeterminate';
  testDate: Date;
  performedBy: string;
  readingTime: number; // minutes
  controlLine: boolean;
  testLine: boolean;
  qualityControl: RDTQualityControl;
  interpretation: string;
  followUpRequired: boolean;
  comments?: string;
}

export interface RDTQualityControl {
  kitStorageTemp: number;
  roomTemperature: number;
  humidity: number;
  kitIntegrity: boolean;
  bufferAdequate: boolean;
  timingCompliant: boolean;
  readingConditions: 'adequate' | 'suboptimal' | 'poor';
}

// Blood Chemistry Tests
export interface BloodChemistryTest {
  id: string;
  testId: string;
  testPanel: 'basic_metabolic' | 'comprehensive_metabolic' | 'liver_function' | 'lipid_profile' | 'cardiac_markers' | 'diabetes_panel';
  parameters: ChemistryParameter[];
  instrument: string;
  calibrationStatus: 'current' | 'due' | 'overdue';
  qualityControl: ChemistryQC;
  comments?: string;
}

export interface ChemistryParameter {
  parameter: string;
  value: number;
  unit: string;
  referenceRange: ReferenceRange;
  flag: 'low' | 'high' | 'critical_low' | 'critical_high' | 'normal';
  delta_check?: DeltaCheck;
}

export interface ReferenceRange {
  lowLimit: number;
  highLimit: number;
  criticalLowLimit?: number;
  criticalHighLimit?: number;
  ageGroup?: 'pediatric' | 'adult' | 'elderly';
  gender?: 'male' | 'female';
}

export interface DeltaCheck {
  previousValue: number;
  previousDate: Date;
  percentChange: number;
  significantChange: boolean;
}

export interface ChemistryQC {
  level1: QCResult;
  level2?: QCResult;
  level3?: QCResult;
  overall: 'pass' | 'fail' | 'warning';
}

export interface QCResult {
  target: number;
  actual: number;
  range: number;
  withinRange: boolean;
  cv: number; // coefficient of variation
}

// Hematology Tests
export interface HematologyTest {
  id: string;
  testId: string;
  completeBloodCount: CBC;
  peripheralSmear?: PeripheralSmear;
  esrTest?: ESRTest;
  coagulationTests?: CoagulationTest[];
  instrument: string;
  analyzerFlags: string[];
  morphologyReview: boolean;
  reviewedBy?: string;
}

export interface CBC {
  wbc: CBCParameter;
  rbc: CBCParameter;
  hemoglobin: CBCParameter;
  hematocrit: CBCParameter;
  mcv: CBCParameter;
  mch: CBCParameter;
  mchc: CBCParameter;
  platelets: CBCParameter;
  neutrophils: CBCParameter;
  lymphocytes: CBCParameter;
  monocytes: CBCParameter;
  eosinophils: CBCParameter;
  basophils: CBCParameter;
}

export interface CBCParameter {
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'low' | 'high' | 'normal' | 'critical';
}

export interface PeripheralSmear {
  rbcMorphology: string;
  wbcMorphology: string;
  plateletMorphology: string;
  parasites: ParasiteFindings[];
  abnormalCells: string[];
  interpretation: string;
  reviewedBy: string;
}

export interface ParasiteFindings {
  parasite: 'plasmodium_falciparum' | 'plasmodium_vivax' | 'plasmodium_ovale' | 'plasmodium_malariae' | 'microfilaria' | 'other';
  stage: string;
  density: 'low' | 'moderate' | 'high';
  count?: number;
}

export interface ESRTest {
  value: number;
  method: 'westergren' | 'wintrobe';
  interpretation: 'normal' | 'elevated';
}

export interface CoagulationTest {
  testName: 'pt' | 'aptt' | 'inr' | 'fibrinogen' | 'bleeding_time' | 'clotting_time';
  value: number;
  unit: string;
  referenceRange: string;
  interpretation: string;
}

// Microbiology Tests
export interface MicrobiologyTest {
  id: string;
  testId: string;
  testType: 'culture' | 'sensitivity' | 'gram_stain' | 'acid_fast' | 'fungal_stain' | 'wet_mount';
  specimen: MicroSpecimen;
  microscopy?: MicroscopyResult;
  culture?: CultureResult;
  sensitivity?: SensitivityResult;
  finalReport: MicrobiologyReport;
}

export interface MicroSpecimen {
  type: 'urine' | 'blood' | 'sputum' | 'wound' | 'csf' | 'stool' | 'throat' | 'other';
  appearance: string;
  quality: 'adequate' | 'inadequate';
  processing: SpecimenProcessing;
}

export interface SpecimenProcessing {
  receivedDate: Date;
  processedDate: Date;
  mediaUsed: string[];
  incubationConditions: string;
  processingNotes: string;
}

export interface MicroscopyResult {
  gramStain?: GramStainResult;
  acidFastStain?: AcidFastResult;
  wetMount?: WetMountResult;
  fungalStain?: FungalStainResult;
}

export interface GramStainResult {
  wbcCount: string;
  bacteria: BacteriaFindings[];
  epithelialCells: string;
  interpretation: string;
}

export interface BacteriaFindings {
  morphology: 'cocci' | 'bacilli' | 'spirochetes';
  arrangement: string;
  gramReaction: 'positive' | 'negative';
  quantity: 'few' | 'moderate' | 'many';
}

export interface AcidFastResult {
  acidFastBacilli: boolean;
  quantity: string;
  morphology: string;
}

export interface WetMountResult {
  parasites: ParasiteFindings[];
  bacteria: boolean;
  fungi: boolean;
  cells: string[];
}

export interface FungalStainResult {
  fungi: boolean;
  type: string;
  morphology: string;
  quantity: string;
}

export interface CultureResult {
  growthDay: number;
  organisms: OrganismFindings[];
  noGrowth: boolean;
  contaminated: boolean;
  finalDay: number;
}

export interface OrganismFindings {
  organism: string;
  quantity: 'light' | 'moderate' | 'heavy';
  significance: 'pathogen' | 'normal_flora' | 'probable_contaminant';
  antibiogram?: SensitivityResult;
}

export interface SensitivityResult {
  method: 'disk_diffusion' | 'broth_microdilution' | 'automated';
  antibiotics: AntibioticSensitivity[];
  interpretation: string;
}

export interface AntibioticSensitivity {
  antibiotic: string;
  result: 'sensitive' | 'resistant' | 'intermediate';
  zone_size?: number;
  mic_value?: number;
  interpretation: string;
}

export interface MicrobiologyReport {
  finalDiagnosis: string;
  clinicalCorrelation: string;
  recommendations: string[];
  reportedBy: string;
  reportDate: Date;
  additionalComments?: string;
}

// Urine Analysis
export interface UrineAnalysis {
  id: string;
  testId: string;
  physicalExam: UrinePhysical;
  chemicalExam: UrineChemical;
  microscopicExam: UrineMicroscopic;
  interpretation: string;
  clinicalCorrelation: string;
}

export interface UrinePhysical {
  color: string;
  clarity: 'clear' | 'slightly_turbid' | 'turbid' | 'cloudy';
  odor: string;
  specificGravity: number;
  volume?: number;
}

export interface UrineChemical {
  ph: number;
  protein: string;
  glucose: string;
  ketones: string;
  blood: string;
  bilirubin: string;
  urobilinogen: string;
  nitrites: 'positive' | 'negative';
  leukocyteEsterase: string;
  ascorbicAcid?: string;
}

export interface UrineMicroscopic {
  wbc: number;
  rbc: number;
  epithelialCells: string;
  bacteria: string;
  casts: CastFindings[];
  crystals: CrystalFindings[];
  yeast: string;
  parasites: string;
  other: string[];
}

export interface CastFindings {
  type: 'hyaline' | 'granular' | 'cellular' | 'waxy' | 'fatty';
  quantity: string;
}

export interface CrystalFindings {
  type: string;
  quantity: string;
  significance: 'normal' | 'abnormal' | 'pathological';
}

// Stool Examination
export interface StoolExamination {
  id: string;
  testId: string;
  macroscopicExam: StoolMacroscopic;
  microscopicExam: StoolMicroscopic;
  occultBloodTest?: OccultBloodTest;
  culture?: StoolCulture;
  interpretation: string;
}

export interface StoolMacroscopic {
  color: string;
  consistency: 'formed' | 'soft' | 'loose' | 'watery';
  odor: string;
  blood: 'present' | 'absent';
  mucus: 'present' | 'absent';
  pus: 'present' | 'absent';
}

export interface StoolMicroscopic {
  wbc: string;
  rbc: string;
  epithelialCells: string;
  bacteria: string;
  parasites: StoolParasites[];
  ova: OvaFindings[];
  fat_globules: string;
  muscle_fibers: string;
  starch_granules: string;
}

export interface StoolParasites {
  parasite: string;
  stage: 'trophozoite' | 'cyst' | 'egg' | 'larva';
  quantity: string;
  viability: 'viable' | 'non_viable';
}

export interface OvaFindings {
  parasite: string;
  quantity: string;
  description: string;
}

export interface OccultBloodTest {
  method: 'chemical' | 'immunochemical';
  result: 'positive' | 'negative';
  interpretation: string;
}

export interface StoolCulture {
  pathogens: string[];
  normalFlora: boolean;
  antibiogram?: SensitivityResult;
}

// Laboratory Equipment and QC
export interface LabEquipment {
  id: string;
  name: string;
  type: 'analyzer' | 'microscope' | 'centrifuge' | 'incubator' | 'autoclave' | 'refrigerator' | 'other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  calibrationStatus: 'current' | 'due' | 'overdue';
  operationalStatus: 'operational' | 'maintenance' | 'broken' | 'retired';
  location: string;
  assignedTechnician: string;
  maintenanceRecords: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceType: 'preventive' | 'corrective' | 'calibration' | 'validation';
  date: Date;
  performedBy: string;
  description: string;
  partsReplaced: string[];
  cost?: number;
  nextScheduled?: Date;
  outcome: 'successful' | 'partial' | 'failed';
}

export interface LabInventory {
  id: string;
  itemName: string;
  itemCode: string;
  category: 'reagent' | 'consumable' | 'control' | 'kit' | 'equipment' | 'supply';
  manufacturer: string;
  lotNumber: string;
  expiryDate: Date;
  quantity: number;
  unit: string;
  minimumStock: number;
  location: string;
  cost?: number;
  supplier: string;
  receivedDate: Date;
  usageTracking: UsageRecord[];
}

export interface UsageRecord {
  date: Date;
  quantityUsed: number;
  test: string;
  technician: string;
  notes?: string;
}

// Common sync status type (referenced from patient.ts)
export interface SyncStatus {
  lastSync: Date;
  syncVersion: number;
  conflicts?: string[];
  status: 'synced' | 'pending' | 'conflict' | 'error';
}