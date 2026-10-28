import React from 'react';
import {
  BedDouble,
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Syringe,
} from 'lucide-react';
import { Alarm, ICUPatient, Severity } from '../types/icu';

interface WardOverviewViewProps {
  patients: ICUPatient[];
  alarms: Alarm[];
  onViewAlarmDetails: (alarm: Alarm) => void;
  onAcknowledgeAlarm: (alarmId: string) => void;
  onNavigateToCorrelation: (groupId?: string) => void;
}

export const WardOverviewView: React.FC<WardOverviewViewProps> = ({
  patients,
  alarms,
  onViewAlarmDetails,
  onAcknowledgeAlarm,
  onNavigateToCorrelation,
}) => {
  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-critical-blink';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Medium':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-medium';
      case 'Normal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" />
            <span>ICU Ward Overview — Bedside Telemetry Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            5-Bed High-Acuity ICU Ward (ICU-01 through ICU-05) real-time vital sign monitors and active alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
          <span>Bed Occupancy: 5 / 5 (100%)</span>
        </div>
      </div>

      {/* 5 Beds Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {patients.map((patient) => {
          const patientAlarms = alarms.filter(
            (a) => a.patientId === patient.bedId && (a.status === 'Active' || a.status === 'Investigating')
          );
          const hasCritical = patientAlarms.some((a) => a.severity === 'Critical');
          const hasHigh = patientAlarms.some((a) => a.severity === 'High');

          return (
            <div
              key={patient.bedId}
              className={`rounded-xl border shadow-xs transition-all overflow-hidden ${
                hasCritical
                  ? 'bg-rose-50/20 border-rose-400'
                  : hasHigh
                  ? 'bg-amber-50/20 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Bed Header */}
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                hasCritical 
                  ? 'bg-rose-100/60 border-rose-300 text-rose-950' 
                  : hasHigh
                  ? 'bg-amber-100/60 border-amber-300 text-amber-950'
                  : 'bg-slate-50/80 border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                    hasCritical ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {patient.bedId}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">{patient.name}</h2>
                    <p className="text-[11px] opacity-80">
                      {patient.age}y {patient.gender} · ID: {patient.patientId} · Day {patient.daysInICU} in ICU
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded font-semibold border ${
                    patient.acuityLevel === 'Critical'
                       ? 'bg-rose-100 text-rose-800 border-rose-300 animate-critical-blink'
                      : patient.acuityLevel === 'Guarded'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {patient.acuityLevel} Acuity
                  </span>
                </div>
              </div>

              {/* Diagnosis and Device badges */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium truncate max-w-sm">
                  Dx: <strong>{patient.admissionReason}</strong>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <span className={`px-1.5 py-0.5 rounded ${patient.connectedDevices.ecg ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>ECG</span>
                  <span className={`px-1.5 py-0.5 rounded ${patient.connectedDevices.spo2 ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>SpO₂</span>
                  <span className={`px-1.5 py-0.5 rounded ${patient.connectedDevices.bp ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>ART/BP</span>
                  <span className={`px-1.5 py-0.5 rounded ${patient.connectedDevices.ventilator ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>VENT</span>
                  <span className={`px-1.5 py-0.5 rounded ${patient.connectedDevices.infusionPump ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'}`}>PUMP</span>
                </div>
              </div>

              {/* Vitals Ribbon */}
              <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Heart Rate */}
                <div className={`p-2.5 rounded-lg border text-center ${
                  patient.vitals.hrStatus === 'high' || patient.vitals.hrStatus === 'low'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>HR (bpm)</span>
                  </div>
                  <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                    {patient.vitals.heartRate}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {patient.vitals.ecgRhythm}
                  </div>
                </div>

                {/* Blood Pressure & MAP */}
                <div className={`p-2.5 rounded-lg border text-center ${
                  patient.vitals.bpStatus === 'critical'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : patient.vitals.bpStatus === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-sky-500" />
                    <span>BP (MAP)</span>
                  </div>
                  <div className="text-base font-extrabold font-mono tabular-nums mt-1">
                    {patient.vitals.bloodPressure.systolic}/{patient.vitals.bloodPressure.diastolic}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                    MAP: {patient.vitals.bloodPressure.map} mmHg
                  </div>
                </div>

                {/* SpO2 */}
                <div className={`p-2.5 rounded-lg border text-center ${
                  patient.vitals.spo2Status === 'critical'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : patient.vitals.spo2Status === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-teal-500" />
                    <span>SpO₂ (%)</span>
                  </div>
                  <div className="text-xl font-extrabold font-mono tabular-nums mt-1">
                    {patient.vitals.spo2}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {patient.vitals.spo2Status === 'critical' ? 'Hypoxemia' : 'Perfusion Good'}
                  </div>
                </div>

                {/* Respiratory & Temp */}
                <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-slate-500" />
                    <span>RR / Temp</span>
                  </div>
                  <div className="text-base font-extrabold font-mono tabular-nums mt-1 text-slate-900">
                    {patient.vitals.respRate} /min
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {patient.vitals.temp}°C · EtCO₂ {patient.vitals.etco2}
                  </div>
                </div>

              </div>

              {/* Active Alarms for this Bed */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Bed Active Alarms ({patientAlarms.length})
                  </span>
                  {patientAlarms.length === 0 && (
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All Alarms Cleared
                    </span>
                  )}
                </div>

                {patientAlarms.length > 0 ? (
                  <div className="space-y-2">
                    {patientAlarms.map((alm) => (
                      <div
                        key={alm.id}
                        onClick={() => onViewAlarmDetails(alm)}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] border ${getSeverityBadgeClass(alm.severity)}`}>
                              {alm.severity}
                            </span>
                            <span className="font-bold text-slate-900 truncate max-w-xs">{alm.alarmDescription}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {alm.timestamp} · {alm.deviceType} ({alm.alarmCode})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {alm.status === 'Active' && (
                            <button
                              onClick={() => onAcknowledgeAlarm(alm.id)}
                              className="px-2 py-0.5 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                              Ack
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-1">
                    No active alarm flags for {patient.name} ({patient.bedId}).
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
