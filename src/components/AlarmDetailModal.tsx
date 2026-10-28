import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  User,
  HardDrive,
  CheckCircle,
  Activity,
  ShieldAlert,
  GitMerge,
  FileText,
} from 'lucide-react';
import { Alarm, Severity } from '../types/icu';

interface AlarmDetailModalProps {
  alarm: Alarm | null;
  onClose: () => void;
  onAcknowledge: (alarmId: string, note?: string) => void;
  onResolve: (alarmId: string) => void;
  onNavigateToCorrelation?: (groupId: string) => void;
}

export const AlarmDetailModal: React.FC<AlarmDetailModalProps> = ({
  alarm,
  onClose,
  onAcknowledge,
  onResolve,
  onNavigateToCorrelation,
}) => {
  const [note, setNote] = useState('');

  if (!alarm) return null;

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Medium':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-medium';
      case 'Normal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
    }
  };

  const handleAck = () => {
    onAcknowledge(alarm.id, note.trim() || undefined);
    onClose();
  };

  const handleResolve = () => {
    onResolve(alarm.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          alarm.severity === 'Critical'
            ? 'bg-rose-50 border-rose-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs border ${getSeverityBadgeClass(alarm.severity)}`}>
              {alarm.severity} Severity
            </span>
            <span className="font-mono text-xs text-slate-500 font-medium">{alarm.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Main Title */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {alarm.alarmDescription}
            </h3>
            <p className="text-slate-500 font-mono mt-1">
              Alarm Code: <strong className="text-slate-700">{alarm.alarmCode}</strong> · Device ID: {alarm.deviceId}
            </p>
          </div>

          {/* Patient and Device Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient</span>
              <span className="font-bold text-slate-900">{alarm.patientId} ({alarm.bedNumber})</span>
              <span className="text-[10px] text-slate-500 block truncate">{alarm.patientName}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Device Type</span>
              <span className="font-semibold text-slate-900">{alarm.deviceType}</span>
              <span className="text-[10px] text-slate-500 block font-mono">{alarm.deviceId}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Signal Quality</span>
              <span className="font-semibold text-slate-800">{alarm.signalQuality}</span>
              <span className="text-[10px] text-slate-500 block">Lead / Sensor OK</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Observed vs Limit</span>
              <span className="font-mono font-bold text-rose-700 block">{alarm.valueObserved || 'Out of Bounds'}</span>
              <span className="text-[10px] font-mono text-slate-500">Limit: {alarm.threshold || 'N/A'}</span>
            </div>
          </div>

          {/* Simulated Waveform Strip */}
          <div className="p-4 rounded-xl bg-slate-950 text-teal-400 font-mono border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Simulated Real-time Telemetry Waveform</span>
              </span>
              <span className="text-teal-400 font-bold">25 mm/s · 10 mm/mV</span>
            </div>

            {/* SVG Waveform Line */}
            <div className="h-16 w-full relative flex items-center">
              <svg className="w-full h-full stroke-teal-400 fill-none" preserveAspectRatio="none" viewBox="0 0 500 100">
                <path
                  d="M0,50 L50,50 L55,42 L60,58 L65,50 L100,50 L110,48 L115,10 L120,90 L125,46 L130,50 L160,50 L170,40 L180,50 L250,50 L260,48 L265,10 L270,90 L275,46 L280,50 L310,50 L320,40 L330,50 L400,50 L410,48 L415,10 L420,90 L425,46 L430,50 L460,50 L470,40 L480,50 L500,50"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Correlation Link banner */}
          {alarm.correlationGroupId && (
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-teal-950">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-teal-700 shrink-0" />
                <span>This alarm belongs to Correlation Group <strong>{alarm.correlationGroupId}</strong></span>
              </div>
              {onNavigateToCorrelation && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToCorrelation(alarm.correlationGroupId!);
                  }}
                  className="font-bold underline text-teal-800 hover:text-teal-950"
                >
                  View Cascade
                </button>
              )}
            </div>
          )}

          {/* Nurse Triage Note Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Clinical Triage Assessment Note</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record bedside clinical findings, suctioning status, IV cannula patency, or physician notification..."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Current Status: <strong className="font-mono uppercase text-slate-800">{alarm.status}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors font-medium text-xs"
            >
              Close
            </button>

            {alarm.status !== 'Resolved' && (
              <button
                onClick={handleResolve}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors text-xs flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}

            {alarm.status === 'Active' && (
              <button
                onClick={handleAck}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors text-xs"
              >
                Acknowledge Alarm
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
