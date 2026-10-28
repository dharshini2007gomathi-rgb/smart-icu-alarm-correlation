import React from 'react';
import {
  BellRing,
  GitMerge,
  AlertOctagon,
  Users,
  ArrowUpRight,
  ShieldAlert,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { Alarm, CorrelationGroup, ICUPatient, Severity } from '../types/icu';
import { CriticalAlertCard } from './CriticalAlertCard';

interface DashboardViewProps {
  alarms: Alarm[];
  correlationGroups: CorrelationGroup[];
  patients: ICUPatient[];
  onAcknowledgeAlarm: (alarmId: string) => void;
  onViewAlarmDetails: (alarm: Alarm) => void;
  onNavigateToCorrelation: (groupId?: string) => void;
  onNavigateToLiveAlarms: () => void;
  onNavigateToWard: (bedId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  alarms,
  correlationGroups,
  patients,
  onAcknowledgeAlarm,
  onViewAlarmDetails,
  onNavigateToCorrelation,
  onNavigateToLiveAlarms,
  onNavigateToWard,
}) => {
  const activeAlarms = alarms.filter((a) => a.status === 'Active' || a.status === 'Investigating');
  const criticalAlarms = activeAlarms.filter((a) => a.severity === 'Critical');
  const highAlarms = activeAlarms.filter((a) => a.severity === 'High');
  const mediumAlarms = activeAlarms.filter((a) => a.severity === 'Medium');

  // Most urgent active critical alarm (if any)
  const leadCriticalAlarm = criticalAlarms.length > 0 ? criticalAlarms[0] : null;

  // Recent alarms (last 6)
  const recentAlarms = [...alarms].slice(0, 7);

  // Top correlation group
  const primaryCorrelation = correlationGroups.length > 0 ? correlationGroups[0] : null;

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Investigating':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Acknowledged':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Resolved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Alarms */}
        <div 
          onClick={onNavigateToLiveAlarms}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Alarms</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {activeAlarms.length}
            </span>
            <span className="text-xs text-slate-500">simulated alarms</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600">
            <span className="text-rose-700 font-semibold">{criticalAlarms.length} Crit</span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-700 font-semibold">{highAlarms.length} High</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600">{mediumAlarms.length} Med</span>
          </div>
        </div>

        {/* Card 2: Related Events Detected */}
        <div 
          onClick={() => onNavigateToCorrelation()}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Related Events Detected</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
              <GitMerge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-800 font-mono tabular-nums">
              {correlationGroups.length}
            </span>
            <span className="text-xs text-slate-500">alarm clusters</span>
          </div>
          <p className="mt-2.5 text-[11px] text-teal-700 font-medium flex items-center gap-1">
            <span>Rule-based cascade analysis active</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Card 3: Critical Alerts */}
        <div 
          onClick={onNavigateToLiveAlarms}
          
className={`rounded-xl border p-5 shadow-xs transition-all cursor-pointer group ${
  criticalAlarms.length > 0
    ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400 critical-alert-blink'
    : 'bg-white border-slate-200 hover:border-slate-300'
}`}

        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Alerts</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
              criticalAlarms.length > 0 
                ? 'bg-rose-600 text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${
              criticalAlarms.length > 0 ? 'text-rose-700' : 'text-slate-800'
            }`}>
              {criticalAlarms.length}
            </span>
            <span className="text-xs text-slate-500">immediate triage</span>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-600">
            {criticalAlarms.length > 0 ? (
              <span className="text-rose-700 font-medium">Beds: {Array.from(new Set(criticalAlarms.map(a => a.patientId))).join(', ')}</span>
            ) : (
              <span>All vital thresholds nominal</span>
            )}
          </p>
        </div>

        {/* Card 4: Patients Monitored */}
        <div 
          onClick={() => onNavigateToWard()}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Monitored</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {patients.length}
            </span>
            <span className="text-xs text-slate-500">simulated beds (ICU 1–5)</span>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-600">
            100% telemetry link uptime
          </p>
        </div>

      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Recent Alarms Table (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Alarms</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time simulated telemetry event stream</p>
            </div>
            <button
              onClick={onNavigateToLiveAlarms}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
            >
              <span>View All ({alarms.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Time</th>
                  <th className="py-2.5 px-3.5">Device</th>
                  <th className="py-2.5 px-3.5">Alarm</th>
                  <th className="py-2.5 px-3.5">Severity</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAlarms.map((alarm) => (
                  <tr 
                    key={alarm.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onViewAlarmDetails(alarm)}
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {alarm.timestamp}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{alarm.deviceType}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{alarm.patientId} · {alarm.deviceId}</div>
                    </td>
                    <td className="py-3 px-3.5 max-w-[220px]">
                      <div className="font-semibold text-slate-900 truncate" title={alarm.alarmDescription}>
                        {alarm.alarmDescription}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{alarm.alarmCode}</div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getSeverityBadgeClass(alarm.severity)}`}>
                        {alarm.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${getStatusBadgeClass(alarm.status)}`}>
                        {alarm.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {alarm.status === 'Active' ? (
                        <button
                          onClick={() => onAcknowledgeAlarm(alarm.id)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Ack
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Logged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing recent {recentAlarms.length} of {alarms.length} telemetry events</span>
            <span className="text-slate-400">IEC 60601-1-8 Compliant Logging</span>
          </div>
        </div>

        {/* Right Side: Critical Alert Panel & Alarm Correlation Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Critical Alert Panel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Critical Alert Panel</span>
              <span className="text-[11px] text-slate-500">High Acuity Triage</span>
            </div>
            <CriticalAlertCard
              criticalAlarm={leadCriticalAlarm}
              onAcknowledge={onAcknowledgeAlarm}
              onViewDetails={onViewAlarmDetails}
              onViewCorrelation={(groupId) => onNavigateToCorrelation(groupId)}
            />
          </div>

          {/* Alarm Correlation Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Alarm Correlation</h3>
              </div>
              <button
                onClick={() => onNavigateToCorrelation()}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
              >
                <span>Analyze All ({correlationGroups.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {primaryCorrelation ? (
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-200">
                      {primaryCorrelation.groupId}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {primaryCorrelation.patientId} · {primaryCorrelation.bedNumber}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Δt: {primaryCorrelation.timeSpanSeconds}s apart
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{primaryCorrelation.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {primaryCorrelation.primaryHypothesis}
                  </p>
                </div>

                {/* Devices Involved */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {primaryCorrelation.devicesInvolved.map((device, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {device}
                    </span>
                  ))}
                </div>

                {/* Evidence & Warning */}
                <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-normal">
                  <span className="font-bold">Confidence: {primaryCorrelation.confidencePercent}%</span> · {primaryCorrelation.clinicalUncertaintyWarning}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    {primaryCorrelation.alarmIds.length} linked active alarms
                  </span>
                  <button
                    onClick={() => onNavigateToCorrelation(primaryCorrelation.groupId)}
                    className="text-xs px-3 py-1.5 rounded font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    View Correlation Tree
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-slate-700">No Multi-Alarm Cascades Detected</p>
                <p className="mt-1">Active alarms are isolated with no synchronized temporal cascades.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};