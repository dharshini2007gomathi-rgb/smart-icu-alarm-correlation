export type DeviceType = 
  | 'ECG monitor' 
  | 'SpO₂ monitor' 
  | 'Blood pressure monitor' 
  | 'Ventilator' 
  | 'Infusion pump';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Normal';

export type AlarmStatus = 'Active' | 'Acknowledged' | 'Investigating' | 'Resolved';

export type SignalQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor (Artifact)';

export interface Alarm {
  id: string;
  timestamp: string; // e.g. "14:24:08"
  date: string; // e.g. "2026-10-26"
  epochMs: number;
  patientId: string; // e.g. "ICU-02"
  bedNumber: string;
  patientName: string;
  deviceId: string;
  deviceType: DeviceType;
  alarmCode: string;
  alarmDescription: string;
  severity: Severity;
  signalQuality: SignalQuality;
  status: AlarmStatus;
  correlationGroupId?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  valueObserved?: string;
  threshold?: string;
  clinicalNote?: string;
}

export interface CorrelationGroup {
  groupId: string; // e.g. "CORR-01"
  title: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  alarmIds: string[];
  devicesInvolved: DeviceType[];
  timeSpanSeconds: number;
  detectedAt: string;
  primaryHypothesis: string;
  reasonForGrouping: string;
  evidenceLevel: 'High' | 'Moderate' | 'Investigational';
  confidencePercent: number;
  alternativeExplanations: string[];
  clinicalUncertaintyWarning: string;
  recommendedAction: string;
  leadAlarmId: string;
}

export interface PatientVitals {
  heartRate: number;
  hrStatus: 'normal' | 'high' | 'low';
  bloodPressure: {
    systolic: number;
    diastolic: number;
    map: number;
  };
  bpStatus: 'normal' | 'critical' | 'warning';
  spo2: number;
  spo2Status: 'normal' | 'critical' | 'warning';
  respRate: number;
  rrStatus: 'normal' | 'high' | 'low';
  etco2: number;
  temp: number;
  ecgRhythm: string;
}

export interface ICUPatient {
  bedId: string; // 'ICU-01', 'ICU-02', etc.
  patientId: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  admissionReason: string;
  daysInICU: number;
  vitals: PatientVitals;
  connectedDevices: {
    ecg: boolean;
    spo2: boolean;
    bp: boolean;
    ventilator: boolean;
    infusionPump: boolean;
  };
  acuityLevel: 'Critical' | 'Guarded' | 'Stable';
}

export type PumpAlarmCategory = 
  | 'Occlusion'
  | 'Low battery'
  | 'Empty fluid container'
  | 'Door or cassette not properly secured'
  | 'Air-in-line'
  | 'Unknown / Unverified';

export interface PumpTroubleshootingGuide {
  id: string;
  model: string;
  alarmCategory: PumpAlarmCategory;
  alarmCode: string;
  alarmName: string;
  urgency: 'High Priority' | 'Medium Priority';
  possibleCauses: string[];
  safeChecksSteps: string[];
  clinicalEscalationCriteria: string;
  verifiedManualReference: string | null;
  manualSection: string | null;
}
