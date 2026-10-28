
import React, { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  Eye,
  GitMerge,
} from 'lucide-react';

import { Alarm, DeviceType, Severity } from '../types/icu';

interface AlarmTimelineViewProps {
  alarms: Alarm[];
  onViewAlarmDetails: (alarm: Alarm) => void;
  onNavigateToCorrelation: (groupId?: string) => void;
}

export const AlarmTimelineView: React.FC<AlarmTimelineViewProps> = ({
  alarms,
  onViewAlarmDetails,
  onNavigateToCorrelation,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<string>('ALL');
  const [hoveredAlarm, setHoveredAlarm] = useState<Alarm | null>(null);

  const deviceTypes: DeviceType[] = [
    'Ventilator',
    'SpO₂ monitor',
    'ECG monitor',
    'Blood pressure monitor',
    'Infusion pump',
  ];

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      const isNotNormal = alarm.severity !== 'Normal';
      const matchesPatient =
        selectedPatient === 'ALL' ||
        alarm.patientId === selectedPatient;

      return isNotNormal && matchesPatient;
    });
  }, [alarms, selectedPatient]);

  const sortedAlarms = useMemo(() => {
    return [...filteredAlarms].sort(
      (a, b) => a.epochMs - b.epochMs
    );
  }, [filteredAlarms]);

  const minTime =
    sortedAlarms.length > 0
      ? sortedAlarms[0].epochMs
      : Date.now() - 3600000;

  const maxTime =
    sortedAlarms.length > 0
      ? sortedAlarms[sortedAlarms.length - 1].epochMs + 60000
      : Date.now();

  const timeSpan = Math.max(maxTime - minTime, 60000);

  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case 'Critical':
        return '#dc2626';
      case 'High':
        return '#d97706';
      case 'Medium':
        return '#0284c7';
      default:
        return '#64748b';
    }
  };

  const getSeverityBadgeClass = (severity: Severity): string => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-900 border-rose-400 font-bold';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-400 font-semibold';
      case 'Medium':
        return 'bg-sky-100 text-sky-900 border-sky-400 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Multi-Modal Alarm Timeline</span>
          </h1>

          <p className="text-xs text-slate-600 mt-1">
            Temporal distribution of Critical, High, and Medium alarms
            across ICU devices.
          </p>
        </div>

        {/* Patient Bed Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs shadow-sm">
          <Filter className="w-3.5 h-3.5 text-slate-600" />

          <span className="text-slate-800 font-semibold">Bed:</span>

          <select
            value={selectedPatient}
            onChange={(e) => {
              setSelectedPatient(e.target.value);
              setHoveredAlarm(null);
            }}
            className="max-w-[250px] text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Beds (ICU-01 to ICU-05)</option>
            <option value="ICU-01">ICU-01 (Gokul Sri)</option>
            <option value="ICU-02">ICU-02 (Gobika)</option>
            <option value="ICU-03">ICU-03 (Deva Dharshini)</option>
            <option value="ICU-04">ICU-04 (Nesana)</option>
            <option value="ICU-05">ICU-05 (Dharshini)</option>
          </select>
        </div>
      </div>

      {/* Severity Legend */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
            Severity Legend:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="text-slate-800 font-semibold">Critical</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600" />
            <span className="text-slate-800 font-semibold">High Priority</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600" />
            <span className="text-slate-800 font-semibold">Medium</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 font-mono text-[11px] font-semibold">
          <span>{filteredAlarms.length} alarms plotted</span>
          <span>·</span>
          <span>Normal alarms excluded</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* LEFT: Alarm Timeline */}
        <div className="xl:col-span-2 min-w-0">
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Device Alarm Timeline
              </h2>

              <span className="text-[10px] text-slate-700 font-semibold">
                Chronological View
              </span>
            </div>

            <div className="space-y-5">
              {deviceTypes.map((device) => {
                const deviceAlarms = sortedAlarms.filter(
                  (alarm) => alarm.deviceType === device
                );

                const firstAlarm =
                  deviceAlarms.length > 0 ? deviceAlarms[0] : null;

                const lastAlarm =
                  deviceAlarms.length > 0
                    ? deviceAlarms[deviceAlarms.length - 1]
                    : null;

                return (
                  <div
                    key={device}
                    className="border-b border-slate-300 pb-5 last:border-b-0 last:pb-0"
                  >
                    {/* Device Name */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-900">
                          {device}
                        </span>

                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                          {deviceAlarms.length}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-700 font-semibold whitespace-nowrap">
                        Channel Active
                      </span>
                    </div>

                    {/* Timeline Track */}
                    <div className="relative h-16 bg-slate-100 rounded-lg border border-slate-300 overflow-hidden">
                      {/* Darker background grid */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none px-3">
                        {[...Array(6)].map((_, index) => (
                          <div
                            key={index}
                            className="h-full border-r-2 border-dashed border-slate-400"
                          />
                        ))}
                      </div>

                      {/* Timeline baseline */}
                      <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 border-t-2 border-slate-400" />

                      {/* Alarm Markers */}
                      {deviceAlarms.map((alarm) => {
                        const relativePercent = Math.max(
                          4,
                          Math.min(
                            96,
                            ((alarm.epochMs - minTime) / timeSpan) * 100
                          )
                        );

                        const color = getSeverityColor(alarm.severity);
                        const isHovered = hoveredAlarm?.id === alarm.id;

                        return (
                          <button
                            type="button"
                            key={alarm.id}
                            style={{
                              left: `${relativePercent}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                            className="absolute z-10 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 rounded-full"
                            onMouseEnter={() => setHoveredAlarm(alarm)}
                            onMouseLeave={() => setHoveredAlarm(null)}
                            onFocus={() => setHoveredAlarm(alarm)}
                            onBlur={() => setHoveredAlarm(null)}
                            onClick={() => onViewAlarmDetails(alarm)}
                            aria-label={`${alarm.severity} alarm at ${alarm.timestamp}. Click to inspect.`}
                          >
                            <span
                              style={{
                                backgroundColor: color,
                                boxShadow: isHovered
                                  ? `0 0 0 5px ${color}40`
                                  : `0 0 0 2px ${color}35`,
                              }}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-transform group-hover:scale-125 ${
                                alarm.severity === 'Critical'
                                  ? 'animate-pulse'
                                  : ''
                              }`}
                            >
                              !
                            </span>
                          </button>
                        );
                      })}

                      {deviceAlarms.length === 0 && (
                        <span className="absolute inset-0 z-10 flex items-center justify-center text-[11px] text-slate-700 font-medium">
                          No non-normal alarms
                        </span>
                      )}
                    </div>

                    {/* Dark timestamps */}
                    {deviceAlarms.length > 0 && (
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-[11px] text-slate-800 font-semibold font-mono">
                          {firstAlarm?.timestamp}
                        </span>

                        <span className="text-[11px] text-slate-800 font-semibold font-mono">
                          {lastAlarm?.timestamp}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Alarm Details */}
            {hoveredAlarm && hoveredAlarm.severity !== 'Normal' ? (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {hoveredAlarm.timestamp}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] border ${getSeverityBadgeClass(
                        hoveredAlarm.severity
                      )}`}
                    >
                      {hoveredAlarm.severity}
                    </span>

                    <span className="text-xs font-semibold text-slate-900">
                      {hoveredAlarm.patientId} ({hoveredAlarm.bedNumber})
                    </span>

                    {hoveredAlarm.correlationGroupId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300 font-bold">
                        Linked to {hoveredAlarm.correlationGroupId}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">
                    {hoveredAlarm.alarmDescription}
                  </h4>

                  <p className="text-[11px] text-slate-700 font-mono break-words">
                    Device: {hoveredAlarm.deviceType} ({hoveredAlarm.deviceId})
                    {' · '}Observed: {hoveredAlarm.valueObserved || 'N/A'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hoveredAlarm.correlationGroupId && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToCorrelation(
                          hoveredAlarm.correlationGroupId
                        )
                      }
                      className="px-3 py-2 rounded text-xs font-semibold bg-teal-100 text-teal-900 border border-teal-300 hover:bg-teal-200 transition-colors flex items-center gap-1"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>View Cascade</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewAlarmDetails(hoveredAlarm)}
                    className="px-3 py-2 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Full Telemetry</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-center text-xs text-slate-700">
                Hover over a Critical, High, or Medium marker to preview
                event details, or click it to inspect telemetry.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ICU Monitoring Image */}
        <aside className="min-w-0">
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 xl:sticky xl:top-4">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                ICU Monitoring
              </h2>

              <p className="text-xs text-slate-700 mt-1">
                Alarm monitoring overview
              </p>
            </div>

            <div className="w-full min-h-[220px] flex items-center justify-center bg-white rounded-lg overflow-hidden">
              <img
                src="/image.png"
                alt="ICU monitoring overview"
                className="w-full max-h-[360px] object-contain"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700">Active devices</span>
                <span className="font-semibold text-slate-900">
                  {deviceTypes.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-slate-700">Displayed alarms</span>
                <span className="font-semibold text-slate-900">
                  {filteredAlarms.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-slate-700">Critical alarms</span>
                <span className="font-bold text-rose-700">
                  {filteredAlarms.filter(
                    (alarm) => alarm.severity === 'Critical'
                  ).length}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
