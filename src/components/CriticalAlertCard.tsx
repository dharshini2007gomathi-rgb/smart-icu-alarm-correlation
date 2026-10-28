import React from 'react';
import { AlertTriangle, Clock, User, HardDrive, CheckCircle2, ArrowRight } from 'lucide-react';
import { Alarm } from '../types/icu';

interface CriticalAlertCardProps {
  criticalAlarm: Alarm | null;
  onAcknowledge: (alarmId: string) => void;
  onViewDetails: (alarm: Alarm) => void;
  onViewCorrelation?: (groupId: string) => void;
}

export const CriticalAlertCard: React.FC<CriticalAlertCardProps> = ({
  criticalAlarm,
  onAcknowledge,
  onViewDetails,
  onViewCorrelation,
}) => {
  if (!criticalAlarm) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">No Active Critical Alarms</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            All high-acuity alarms in Ward 4B are currently stable, acknowledged, or within acceptable parameters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/70 border-2 border-rose-500 rounded-xl p-5 shadow-xs relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-200">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Priority Alert · Immediate Action Required</span>
        </div>
        <span className="font-mono text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
          {criticalAlarm.timestamp}
        </span>
      </div>

      {/* Main Alert Message */}
      <div className="mt-3.5">
        <h3 className="text-base font-bold text-rose-950 leading-snug">
          CRITICAL: {criticalAlarm.alarmDescription}
        </h3>
        <p className="text-xs text-rose-900 mt-1 font-medium">
          Assess the patient immediately according to ICU protocol.
        </p>
      </div>

      {/* Alarm Metadata Grid */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/90 p-3 rounded-lg border border-rose-200">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Patient Bed</span>
          <span className="font-bold text-slate-800">{criticalAlarm.patientId} ({criticalAlarm.bedNumber})</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Device</span>
          <span className="font-medium text-slate-800">{criticalAlarm.deviceType}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Observed Value</span>
          <span className="font-mono font-bold text-rose-700">{criticalAlarm.valueObserved || 'Out of Bounds'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Threshold</span>
          <span className="font-mono text-slate-600">{criticalAlarm.threshold || 'Critical Limit'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-200">
        <div className="text-[11px] text-rose-800">
          Status: <strong className="font-semibold uppercase">{criticalAlarm.status}</strong>
        </div>

        <div className="flex items-center gap-2">
          {criticalAlarm.correlationGroupId && onViewCorrelation && (
            <button
              onClick={() => onViewCorrelation(criticalAlarm.correlationGroupId!)}
              className="text-xs px-3 py-1.5 rounded font-medium bg-rose-100 hover:bg-rose-200 text-rose-900 transition-colors flex items-center gap-1"
            >
              <span>View Correlation Cascade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onViewDetails(criticalAlarm)}
            className="text-xs px-3 py-1.5 rounded font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
          >
            Inspect Telemetry
          </button>

          {criticalAlarm.status === 'Active' && (
            <button
              onClick={() => onAcknowledge(criticalAlarm.id)}
              className="text-xs px-3.5 py-1.5 rounded font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
            >
              Acknowledge & Triage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
