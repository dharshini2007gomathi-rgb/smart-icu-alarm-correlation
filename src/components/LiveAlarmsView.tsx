
import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  GitMerge,
  Eye,
  CheckCircle,
  Undo2,
} from 'lucide-react';
import { Alarm, DeviceType, Severity, SignalQuality } from '../types/icu';

interface LiveAlarmsViewProps {
  alarms: Alarm[];
  onAcknowledgeAlarm: (alarmId: string) => void;
  onUndoAcknowledgeAlarm: (alarmId: string) => void;
  onResolveAlarm: (alarmId: string) => void;
  onViewAlarmDetails: (alarm: Alarm) => void;
  onNavigateToCorrelation: (groupId?: string) => void;
}

export const LiveAlarmsView: React.FC<LiveAlarmsViewProps> = ({
  alarms,
  onAcknowledgeAlarm,
  onUndoAcknowledgeAlarm,
  onResolveAlarm,
  onViewAlarmDetails,
  onNavigateToCorrelation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const deviceTypes: DeviceType[] = [
    'ECG monitor',
    'SpO₂ monitor',
    'Blood pressure monitor',
    'Ventilator',
    'Infusion pump',
  ];

  const severities: Severity[] = [
    'Critical',
    'High',
    'Medium',
    'Normal',
  ];

  const patientIds = [
    'ICU-01',
    'ICU-02',
    'ICU-03',
    'ICU-04',
    'ICU-05',
  ];

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();

        const matches =
          alarm.alarmDescription.toLowerCase().includes(query) ||
          alarm.alarmCode.toLowerCase().includes(query) ||
          alarm.patientId.toLowerCase().includes(query) ||
          alarm.patientName.toLowerCase().includes(query) ||
          alarm.deviceId.toLowerCase().includes(query) ||
          alarm.deviceType.toLowerCase().includes(query);

        if (!matches) return false;
      }

      if (
        selectedDeviceType !== 'ALL' &&
        alarm.deviceType !== selectedDeviceType
      ) {
        return false;
      }

      if (
        selectedSeverity !== 'ALL' &&
        alarm.severity !== selectedSeverity
      ) {
        return false;
      }

      if (
        selectedPatientId !== 'ALL' &&
        alarm.patientId !== selectedPatientId
      ) {
        return false;
      }

      if (
        selectedStatus !== 'ALL' &&
        alarm.status !== selectedStatus
      ) {
        return false;
      }

      return true;
    });
  }, [
    alarms,
    searchQuery,
    selectedDeviceType,
    selectedSeverity,
    selectedPatientId,
    selectedStatus,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDeviceType('ALL');
    setSelectedSeverity('ALL');
    setSelectedPatientId('ALL');
    setSelectedStatus('ALL');
  };

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

  const getSignalQualityBadge = (quality: SignalQuality) => {
    switch (quality) {
      case 'Excellent':
        return (
          <span className="text-emerald-700 font-medium text-[11px]">
            ● Excellent
          </span>
        );
      case 'Good':
        return (
          <span className="text-teal-700 font-medium text-[11px]">
            ● Good
          </span>
        );
      case 'Fair':
        return (
          <span className="text-amber-700 font-medium text-[11px]">
            ▲ Fair
          </span>
        );
      case 'Poor (Artifact)':
        return (
          <span className="text-rose-700 font-bold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            ⚠ Artifact Noise
          </span>
        );
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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Live Device Alarms
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous ward telemetry feed with device-level signal diagnostics and physiological alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
            {filteredAlarms.length} of {alarms.length} Alarms
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, device, patient, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Devices</option>
              {deviceTypes.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Severities</option>
              {severities.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="ALL">All Patients</option>
              {patientIds.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alarm Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b172a] text-slate-200 font-semibold border-b border-[#1e293b]">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Patient ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Device ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Device Type</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Alarm Code</th>
                <th className="py-3 px-3.5 min-w-[220px]">Alarm Description</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Severity</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Signal Quality</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Clinical Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAlarms.length > 0 ? (
                filteredAlarms.map((alarm) => (
                  <tr
                    key={alarm.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onViewAlarmDetails(alarm)}
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-700 tabular-nums whitespace-nowrap font-medium">
                      {alarm.timestamp}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">
                        {alarm.patientId}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {alarm.bedNumber}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {alarm.deviceId}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-800">
                      {alarm.deviceType}
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {alarm.alarmCode}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 max-w-sm">
                        {alarm.alarmDescription}
                      </div>
                      {alarm.valueObserved && (
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Value:{' '}
                          <span className="font-bold text-slate-700">
                            {alarm.valueObserved}
                          </span>{' '}
                          (Limit: {alarm.threshold || 'N/A'})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[11px] border ${getSeverityBadgeClass(alarm.severity)}`}
                      >
                        {alarm.severity}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getSignalQualityBadge(alarm.signalQuality)}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${getStatusBadgeClass(alarm.status)}`}
                      >
                        {alarm.status}
                      </span>
                    </td>

                    <td
                      className="py-3 px-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {alarm.correlationGroupId && (
                          <button
                            onClick={() =>
                              onNavigateToCorrelation(alarm.correlationGroupId)
                            }
                            title="View Correlation Cascade"
                            className="p-1.5 rounded text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onViewAlarmDetails(alarm)}
                          title="Inspect Telemetry"
                          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {alarm.status === 'Active' && (
                          <button
                            onClick={() => {
                              const confirmed = window.confirm(
                                'Are you sure you want to acknowledge this alarm?'
                              );
                              if (confirmed) {
                                onAcknowledgeAlarm(alarm.id);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                          >
                            Ack
                          </button>
                        )}

                        {alarm.status === 'Acknowledged' && (
                          <>
                            <button
                              onClick={() => {
                                const confirmed = window.confirm(
                                  'Undo acknowledgement and return this alarm to Active?'
                                );
                                if (confirmed) {
                                  onUndoAcknowledgeAlarm(alarm.id);
                                }
                              }}
                              title="Return alarm to Active"
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-colors flex items-center gap-1"
                            >
                              <Undo2 className="w-3 h-3" />
                              Undo Ack
                            </button>

                            <button
                              onClick={() => onResolveAlarm(alarm.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        )}

                        {alarm.status === 'Investigating' && (
                          <button
                            onClick={() => onResolveAlarm(alarm.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                          >
                            Resolve
                          </button>
                        )}

                        {alarm.status === 'Resolved' && (
                          <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 justify-end">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">
                      No Alarms Matched Your Filter
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing search keywords or selecting all device types.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>Devices: ECG, SpO₂, Blood Pressure, Ventilator, Infusion Pump</span>
            <span>·</span>
            <span className="font-mono">Sync: Zero Data Loss Buffer</span>
          </div>
          <div className="text-slate-400">
            Click any row to open patient waveform and telemetry inspector
          </div>
        </div>
      </div>
    </div>
  );
};
