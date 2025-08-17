// Clinical Data Types

export interface VitalSigns {
  id: string;
  consultationId: string;
  bloodPressure: BloodPressure;
  heartRate: number;
  respiratoryRate?: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number; // calculated
  bloodGlucose?: number;
  oxygenSaturation?: number;
  painScore?: number; // 0-10 scale
  recordedDateTime: Date;
  recordedBy: string;
  notes?: string;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  pulse: number;
  date: Date;
}

export interface ClinicalAssessment {
  id: string;
  consultationId: string;
  patientId: string;
  assessmentType: 'initial' | 'follow_up' | 'discharge' | 'emergency';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: ReviewOfSystems;
  physicalExamination: PhysicalExamination;
  clinicalImpression: string;
  differentialDiagnoses: string[];
  assessmentPlan: AssessmentPlan;
  provider: string;
  dateTime: Date;
}

export interface ReviewOfSystems {
  constitutional: SystemReview;
  cardiovascular: SystemReview;
  respiratory: SystemReview;
  gastrointestinal: SystemReview;
  genitourinary: SystemReview;
  neurological: SystemReview;
  musculoskeletal: SystemReview;
  integumentary: SystemReview;
  psychiatric: SystemReview;
  endocrine: SystemReview;
}

export interface SystemReview {
  symptoms: string[];
  notes: string;
  significant: boolean;
}

export interface PhysicalExamination {
  general: GeneralAppearance;
  vitals: VitalSigns;
  heent: HEENTExam;
  cardiovascular: CardiovascularExam;
  respiratory: RespiratoryExam;
  abdominal: AbdominalExam;
  neurological: NeurologicalExam;
  musculoskeletal: MusculoskeletalExam;
  skin: SkinExam;
  other?: string;
}

export interface GeneralAppearance {
  appearance: string;
  distress: 'none' | 'mild' | 'moderate' | 'severe';
  alertness: 'alert' | 'drowsy' | 'confused' | 'unconscious';
  cooperation: 'cooperative' | 'uncooperative' | 'agitated';
  hygiene: 'good' | 'fair' | 'poor';
}

export interface HEENTExam {
  head: string;
  eyes: string;
  ears: string;
  nose: string;
  throat: string;
  lymphNodes: string;
}

export interface CardiovascularExam {
  heartRate: number;
  rhythm: 'regular' | 'irregular';
  murmurs: string;
  gallops: string;
  pulses: string;
  edema: string;
  jugularVenousPressure: string;
}

export interface RespiratoryExam {
  respiratoryRate: number;
  oxygenSaturation: number;
  breathSounds: string;
  chestExpansion: string;
  tactileFremitus: string;
  percussion: string;
  adventitionSounds: string[];
}

export interface AbdominalExam {
  inspection: string;
  palpation: string;
  percussion: string;
  auscultation: string;
  organomegaly: string;
  masses: string;
  tenderness: string;
}

export interface NeurologicalExam {
  mentalStatus: string;
  cranialNerves: string;
  motorSystem: MotorExam;
  sensorySystem: string;
  reflexes: ReflexExam;
  coordination: string;
  gait: string;
}

export interface MotorExam {
  strength: string;
  tone: string;
  bulk: string;
  fasciculations: boolean;
  involuntaryMovements: string;
}

export interface ReflexExam {
  deepTendonReflexes: string;
  superficialReflexes: string;
  pathologicalReflexes: string;
}

export interface MusculoskeletalExam {
  inspection: string;
  palpation: string;
  rangeOfMotion: string;
  strength: string;
  stability: string;
  deformities: string;
}

export interface SkinExam {
  color: string;
  texture: string;
  lesions: SkinLesion[];
  rash: string;
  temperature: string;
  moisture: string;
}

export interface SkinLesion {
  type: string;
  location: string;
  size: string;
  color: string;
  description: string;
}

export interface AssessmentPlan {
  diagnoses: ClinicalDiagnosis[];
  treatments: TreatmentOrder[];
  investigations: InvestigationOrder[];
  referrals: string[];
  followUp: FollowUpPlan;
  patientEducation: string[];
  disposition: 'discharge' | 'admit' | 'observe' | 'transfer' | 'refer';
}

export interface ClinicalDiagnosis {
  diagnosis: string;
  icdCode: string;
  type: 'primary' | 'secondary' | 'comorbidity';
  certainty: 'confirmed' | 'probable' | 'possible' | 'rule_out';
  chronicity: 'acute' | 'chronic' | 'acute_on_chronic';
}

export interface TreatmentOrder {
  type: 'medication' | 'procedure' | 'therapy' | 'lifestyle';
  description: string;
  instructions: string;
  duration: string;
  frequency?: string;
  route?: string;
  dosage?: string;
  provider: string;
  startDate: Date;
  endDate?: Date;
}

export interface InvestigationOrder {
  type: 'laboratory' | 'radiology' | 'procedure' | 'consultation';
  test: string;
  indication: string;
  urgency: 'routine' | 'urgent' | 'stat';
  instructions: string;
  provider: string;
  orderDate: Date;
  expectedDate?: Date;
}

export interface FollowUpPlan {
  required: boolean;
  timeframe: string;
  provider: string;
  instructions: string;
  appointmentBooked: boolean;
  appointmentDate?: Date;
}

// Specialized Clinical Assessments

export interface NCDAssessment {
  id: string;
  patientId: string;
  conditionType: 'hypertension' | 'diabetes' | 'copd' | 'asthma' | 'epilepsy';
  assessmentDate: Date;
  controlStatus: NCDControlAssessment;
  complications: NCDComplication[];
  riskFactors: RiskFactorAssessment;
  treatmentAdherence: TreatmentAdherence;
  lifestyle: LifestyleAssessment;
  provider: string;
  nextAssessment: Date;
}

export interface NCDControlAssessment {
  bloodPressureControl?: BPControlStatus;
  glucoseControl?: GlucoseControlStatus;
  respiratoryControl?: RespiratoryControlStatus;
  overallControl: 'excellent' | 'good' | 'fair' | 'poor';
  targetsMet: string[];
  targetsNotMet: string[];
}

export interface BPControlStatus {
  systolicTarget: number;
  diastolicTarget: number;
  currentSystolic: number;
  currentDiastolic: number;
  controlled: boolean;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface GlucoseControlStatus {
  fastingTarget: number;
  randomTarget: number;
  hba1cTarget: number;
  currentFasting?: number;
  currentRandom?: number;
  currentHbA1c?: number;
  controlled: boolean;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface RespiratoryControlStatus {
  peakFlowTarget?: number;
  currentPeakFlow?: number;
  symptomsControlled: boolean;
  exacerbations: number;
  inhalerTechnique: 'good' | 'needs_improvement' | 'poor';
}

export interface NCDComplication {
  type: 'microvascular' | 'macrovascular' | 'acute';
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateDetected: Date;
  status: 'active' | 'resolved' | 'stable';
}

export interface RiskFactorAssessment {
  smoking: 'never' | 'former' | 'current';
  alcohol: 'never' | 'social' | 'moderate' | 'heavy';
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'vigorous';
  diet: 'poor' | 'fair' | 'good' | 'excellent';
  stress: 'low' | 'moderate' | 'high';
  familyHistory: string[];
  bmi: number;
  waistCircumference?: number;
}

export interface TreatmentAdherence {
  medicationAdherence: MedicationAdherence[];
  appointmentAdherence: 'excellent' | 'good' | 'fair' | 'poor';
  lifestyleAdherence: 'excellent' | 'good' | 'fair' | 'poor';
  barriers: string[];
  motivationLevel: 'high' | 'moderate' | 'low';
}

export interface MedicationAdherence {
  medication: string;
  prescribed: boolean;
  taking: boolean;
  adherenceRate: number; // 0-100%
  barriers: string[];
  sideEffects: string[];
}

export interface LifestyleAssessment {
  dietaryHabits: DietaryAssessment;
  physicalActivity: PhysicalActivityAssessment;
  smokingStatus: SmokingAssessment;
  alcoholConsumption: AlcoholAssessment;
  sleepPattern: SleepAssessment;
  stressManagement: StressAssessment;
}

export interface DietaryAssessment {
  mealFrequency: number;
  vegetableServings: number;
  fruitServings: number;
  saltIntake: 'low' | 'moderate' | 'high';
  fatIntake: 'low' | 'moderate' | 'high';
  sugarIntake: 'low' | 'moderate' | 'high';
  waterIntake: number; // liters per day
  specialDiet: string[];
}

export interface PhysicalActivityAssessment {
  weeklyMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  type: string[];
  barriers: string[];
  motivation: 'high' | 'moderate' | 'low';
}

export interface SmokingAssessment {
  status: 'never' | 'former' | 'current';
  packYears?: number;
  quitAttempts?: number;
  readinessToQuit?: 'not_ready' | 'contemplating' | 'preparing' | 'action';
  nicotineReplacement?: boolean;
}

export interface AlcoholAssessment {
  status: 'never' | 'former' | 'current';
  unitsPerWeek?: number;
  auditScore?: number;
  problemDrinking: boolean;
}

export interface SleepAssessment {
  hoursPerNight: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  difficulties: string[];
  sleepApnea: boolean;
}

export interface StressAssessment {
  level: 'low' | 'moderate' | 'high';
  sources: string[];
  copingMechanisms: string[];
  supportSystem: 'poor' | 'fair' | 'good' | 'excellent';
}

// Emergency and Trauma
export interface EmergencyAssessment {
  id: string;
  patientId: string;
  triageCategory: 'red' | 'yellow' | 'green' | 'black';
  chiefComplaint: string;
  emergencyType: 'medical' | 'surgical' | 'trauma' | 'psychiatric' | 'obstetric';
  vitalSigns: VitalSigns;
  consciousness: ConsciousnessLevel;
  painAssessment: PainAssessment;
  injuryAssessment?: InjuryAssessment;
  interventions: EmergencyIntervention[];
  disposition: EmergencyDisposition;
  provider: string;
  arrivalTime: Date;
  assessmentTime: Date;
}

export interface ConsciousnessLevel {
  glasgowComaScale: GlasgowComaScale;
  alertness: 'alert' | 'voice' | 'pain' | 'unresponsive';
  orientation: OrientationAssessment;
}

export interface GlasgowComaScale {
  eyeOpening: number; // 1-4
  verbalResponse: number; // 1-5
  motorResponse: number; // 1-6
  total: number; // 3-15
}

export interface OrientationAssessment {
  person: boolean;
  place: boolean;
  time: boolean;
  situation: boolean;
  score: number; // 0-4
}

export interface PainAssessment {
  scale: 'numeric' | 'faces' | 'behavioral';
  score: number; // 0-10
  location: string;
  character: string;
  radiation: string;
  timing: string;
  severity: 'mild' | 'moderate' | 'severe';
  aggravatingFactors: string[];
  relievingFactors: string[];
}

export interface InjuryAssessment {
  mechanism: string;
  bodyRegions: InjuredBodyRegion[];
  injurySeverityScore?: number;
  traumaScore?: number;
  bloodLoss: 'none' | 'minimal' | 'moderate' | 'severe';
  fractures: Fracture[];
  wounds: Wound[];
}

export interface InjuredBodyRegion {
  region: string;
  injuries: string[];
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
}

export interface Fracture {
  bone: string;
  type: 'closed' | 'open' | 'pathological';
  displacement: boolean;
  immobilization: string;
}

export interface Wound {
  type: 'laceration' | 'puncture' | 'abrasion' | 'burn' | 'bite';
  location: string;
  size: string;
  depth: 'superficial' | 'deep' | 'full_thickness';
  contamination: 'clean' | 'contaminated' | 'infected';
  treatment: string;
}

export interface EmergencyIntervention {
  type: 'medication' | 'procedure' | 'monitoring' | 'supportive';
  intervention: string;
  time: Date;
  provider: string;
  outcome: string;
}

export interface EmergencyDisposition {
  disposition: 'discharge' | 'admit' | 'transfer' | 'deceased' | 'left_ama';
  destination?: string;
  condition: 'stable' | 'unstable' | 'critical' | 'improved' | 'unchanged' | 'worse';
  instructions: string;
  followUp?: string;
}