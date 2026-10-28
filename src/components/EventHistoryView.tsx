import React, { useState, useMemo } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { Alarm, Severity } from '../types/icu';

interface EventHistoryViewProps {
  alarms: Alarm[];
  onViewAlarmDetails: (alarm: Alarm) => void;
}

export const EventHistoryView: React.FC<EventHistoryViewProps> = ({
  alarms,
  onViewAlarmDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [patientFilter, setPatientFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return alarms.filter((item) => {
      if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
      if (patientFilter !== 'ALL' && item.patientId !== patientFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.alarmDescription.toLowerCase().includes(q) ||
          item.alarmCode.toLowerCase().includes(q) ||
          item.patientId.toLowerCase().includes(q) ||
          item.patientName.toLowerCase().includes(q) ||
          item.deviceType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alarms, searchTerm, severityFilter, patientFilter]);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Timestamp',
      'Patient ID',
      'Bed',
      'Patient Name',
      'Device Type',
      'Device ID',
      'Alarm Code',
      'Alarm Description',
      'Severity',
      'Status',
      'Signal Quality',
      'Observed Value',
      'Threshold',
      'Correlation Group',
    ];

    const rows = filtered.map((a) => [
      a.id,
      a.date,
      a.timestamp,
      a.patientId,
      a.bedNumber,
      `"${a.patientName}"`,
      `"${a.deviceType}"`,
      a.deviceId,
      a.alarmCode,
      `"${a.alarmDescription.replace(/"/g, '""')}"`,
      a.severity,
      a.status,
      a.signalQuality,
      `"${a.valueObserved || ''}"`,
      `"${a.threshold || ''}"`,
      a.correlationGroupId || 'None',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ICU_SENSE_Alarm_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span>ICU Event History & Clinical Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable clinical event trail for quality assurance, root cause analysis, and medical compliance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical events by keyword, device, or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
            >
              <option value="ALL">All Patients (ICU-01 to ICU-05)</option>
              <option value="ICU-01">ICU-01</option>
              <option value="ICU-02">ICU-02</option>
              <option value="ICU-03">ICU-03</option>
              <option value="ICU-04">ICU-04</option>
              <option value="ICU-05">ICU-05</option>
            </select>
          </div>

        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b172a] text-slate-200 font-semibold border-b border-[#1e293b]">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap">Event ID</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Patient / Bed</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Device</th>
                <th className="py-3 px-3.5 min-w-[200px]">Alarm Code & Description</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Severity</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Correlation</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Audit Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onViewAlarmDetails(item)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{item.patientId}</span>
                    <span className="block text-[10px] text-slate-500">{item.patientName}</span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-800">
                    {item.deviceType}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900">{item.alarmDescription}</div>
                    <span className="font-mono text-[10px] text-slate-500">{item.alarmCode}</span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getSeverityBadgeClass(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {item.correlationGroupId ? (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                        {item.correlationGroupId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Isolated</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-slate-600 uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewAlarmDetails(item)}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Total records: {filtered.length} entries</span>
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Audited & cryptographically sequenced</span>
          </span>
        </div>
      </div>

    </div>
  );
};
