import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Cpu,
  Eye,
  GitMerge,
  Heart,
  Info,
  Link2,
  ShieldAlert,
  SlidersHorizontal,
  Syringe,
} from 'lucide-react';

import type { Alarm, CorrelationGroup, Severity } from '../types/icu';

interface CorrelationAnalysisViewProps {
  correlationGroups: CorrelationGroup[];
  allAlarms: Alarm[];
  selectedGroupId?: string | null;
  onSelectGroup?: (groupId: string | null) => void;
  onViewAlarmDetails: (alarm: Alarm) => void;
  onAcknowledgeAlarm: (alarmId: string) => void;
  timeWindowSeconds: number;
  onChangeTimeWindow: (seconds: number) => void;
}

const getSeverityClass = (severity: Severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
    case 'High':
      return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    case 'Medium':
      return 'bg-sky-100 text-sky-800 border-sky-300 font-medium';
    case 'Normal':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getDeviceIcon = (deviceType: string) => {
  const name = deviceType.toLowerCase();

  if (name.includes('pump') || name.includes('infusion')) {
    return Syringe;
  }

  if (name.includes('ecg') || name.includes('heart')) {
    return Heart;
  }

  if (name.includes('spo2') || name.includes('spo₂')) {
    return Activity;
  }

  return Cpu;
};

const getDeviceIconColor = (severity: Severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-500 text-white';
    case 'High':
      return 'bg-amber-500 text-white';
    case 'Medium':
      return 'bg-sky-500 text-white';
    default:
      return 'bg-emerald-500 text-white';
  }
};

export const CorrelationAnalysisView: React.FC<
  CorrelationAnalysisViewProps
> = ({
  correlationGroups,
  allAlarms,
  selectedGroupId,
  onSelectGroup,
  onViewAlarmDetails,
  onAcknowledgeAlarm,
  timeWindowSeconds,
  onChangeTimeWindow,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    selectedGroupId ?? correlationGroups[0]?.groupId ?? null
  );

  useEffect(() => {
    if (
      selectedGroupId &&
      correlationGroups.some(
        (group) => group.groupId === selectedGroupId
      )
    ) {
      setActiveAccordion(selectedGroupId);
    }
  }, [selectedGroupId, correlationGroups]);

  useEffect(() => {
    if (
      activeAccordion &&
      !correlationGroups.some(
        (group) => group.groupId === activeAccordion
      )
    ) {
      setActiveAccordion(correlationGroups[0]?.groupId ?? null);
    }
  }, [activeAccordion, correlationGroups]);

  const handleGroupToggle = (groupId: string) => {
    const nextId = activeAccordion === groupId ? null : groupId;

    setActiveAccordion(nextId);
    onSelectGroup?.(nextId);
  };

  return (
    <div className="space-y-5 text-slate-800">

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <GitMerge className="h-5 w-5 text-teal-600" />
            Alarm Correlation
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Multi-device ICU alarm correlation and clinical event analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 sm:self-auto">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />

          <span className="text-xs font-medium text-slate-600">
            Time Window
          </span>

          {[5, 10, 20, 30].map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onChangeTimeWindow(seconds)}
              aria-pressed={timeWindowSeconds === seconds}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                timeWindowSeconds === seconds
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      

      {/* Empty State */}
      {correlationGroups.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-500" />

          <h2 className="text-sm font-bold text-slate-900">
            No Correlation Clusters Detected
          </h2>

          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
            No groups have been supplied by the correlation engine.
            Individual device alarms remain available in Live Device Alarms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {correlationGroups.map((group) => {
            const isExpanded = activeAccordion === group.groupId;

            const groupAlarms = allAlarms
              .filter((alarm) => group.alarmIds.includes(alarm.id))
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );

            const criticalCount = groupAlarms.filter(
              (alarm) => alarm.severity === 'Critical'
            ).length;

            return (
              <section
                key={group.groupId}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Related Alarms Header */}
                <button
                  type="button"
                  onClick={() => handleGroupToggle(group.groupId)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50">
                      <Link2 className="h-5 w-5 text-teal-700" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                          Related Alarms
                        </h2>

                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {groupAlarms.length} alarms
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {group.title} · {group.bedNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-right">
                      <p className="text-xs font-bold text-teal-800">
                        Confidence: {group.confidencePercent}%
                      </p>
                      <p className="text-[10px] text-teal-700">
                        Rule-based estimate
                      </p>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Correlation Details */}
                {isExpanded && (
                  <div className="space-y-3 p-3">

                    {/* Device Timeline */}
                    <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                      <div className="mb-3 flex items-center justify-center gap-2">
                        <span className="h-px w-10 bg-rose-200" />
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600">
                          {group.timeSpanSeconds} seconds
                        </span>
                        <span className="h-px w-10 bg-rose-200" />
                      </div>

                      {groupAlarms.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
                          <Info className="mx-auto mb-2 h-5 w-5 text-slate-400" />

                          <p className="text-sm font-semibold text-slate-800">
                            No matching alarm records
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            The group references alarm IDs that are not
                            present in the current alarm list.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-stretch md:gap-0">
                          {groupAlarms.map((alarm, index) => {
                            const DeviceIcon = getDeviceIcon(
                              alarm.deviceType
                            );

                            return (
                              <React.Fragment key={alarm.id}>
                                {/* Individual Device Card */}
                                <article
                                  className={`min-w-0 flex-1 rounded-xl border bg-white p-3 ${
                                    alarm.severity === 'Critical'
                                      ? 'border-rose-300'
                                      : alarm.severity === 'High'
                                      ? 'border-amber-200'
                                      : 'border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getDeviceIconColor(
                                        alarm.severity
                                      )}`}
                                    >
                                      <DeviceIcon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <h3 className="break-words text-xs font-bold text-slate-900">
                                        {alarm.deviceType}
                                      </h3>

                                      <p className="mt-0.5 text-[10px] font-mono text-slate-500">
                                        {alarm.deviceId}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 space-y-1">
                                    <p className="text-xs font-semibold text-slate-800">
                                      {alarm.alarmCode}
                                    </p>

                                    <p className="break-words text-xs leading-relaxed text-slate-600">
                                      {alarm.alarmDescription}
                                    </p>

                                    {alarm.valueObserved != null &&
                                      String(alarm.valueObserved).trim() !== '' && (
                                        <p className="break-words text-[11px] text-slate-500">
                                          Value: {String(alarm.valueObserved)}
                                        </p>
                                      )}
                                  </div>

                                  <div className="mt-3 border-t border-slate-100 pt-2">
                                    <p className="text-center text-[11px] font-mono text-slate-600">
                                      {alarm.timestamp}
                                    </p>

                                    <div className="mt-2 flex justify-center">
                                      <span
                                        className={`inline-block rounded border px-2.5 py-1 text-[11px] ${getSeverityClass(
                                          alarm.severity
                                        )}`}
                                      >
                                        {alarm.severity}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center justify-center gap-3 border-t border-slate-100 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => onViewAlarmDetails(alarm)}
                                      className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      Details
                                    </button>

                                    {alarm.status === 'Active' && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onAcknowledgeAlarm(alarm.id)
                                        }
                                        className="rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                                      >
                                        Ack
                                      </button>
                                    )}
                                  </div>
                                </article>

                                {/* Device Connection */}
                                {index < groupAlarms.length - 1 && (
                                  <div className="flex h-6 shrink-0 items-center justify-center md:h-auto md:w-7">
                                    <ChevronRight className="h-5 w-5 text-rose-400" />
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Explanation Panels */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <Link2 className="h-4 w-4 text-sky-700" />
                          Why these alarms are grouped?
                        </h3>

                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
                          <li>
                            They occurred within {group.timeSpanSeconds} seconds.
                          </li>

                         <li>
                        They belong to patient {group.patientId}, {group.bedNumber}.
</li>

                          <li>
                            Different devices may report related events.
                          </li>
                        </ul>

                        {group.reasonForGrouping && (
                          <p className="mt-3 border-t border-sky-200 pt-2 text-xs leading-relaxed text-slate-600">
                            <strong className="text-slate-800">
                              Grouping rationale:
                            </strong>{' '}
                            {group.reasonForGrouping}
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3">
                        <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900">
                          <Info className="h-4 w-4 text-sky-700" />
                          Other possible reasons
                        </h3>

                        {group.alternativeExplanations.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
                            {group.alternativeExplanations.map(
                              (reason, index) => (
                                <li key={index}>{reason}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-slate-600">
                            <li>Separate device or sensor issues.</li>
                            <li>Unrelated patient deterioration.</li>
                            <li>Timing alone cannot confirm cause.</li>
                          </ul>
                        )}
                      </div>
                    </div>

                   

                    {/* Summary Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span className="text-xs text-slate-600">
                        Correlation window:{' '}
                        <strong>{timeWindowSeconds}s</strong>
                      </span>

                      <span className="text-xs text-slate-600">
                        Critical alarms:{' '}
                        <strong className="text-rose-700">
                          {criticalCount}
                        </strong>
                      </span>

                      <span className="text-xs text-slate-600">
                        Evidence: <strong>{group.evidenceLevel}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CorrelationAnalysisView;