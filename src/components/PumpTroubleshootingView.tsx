import React, { useMemo, useState } from 'react';
import {
  Syringe,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Wrench,
  ShieldAlert,
  HelpCircle,
  FileText,
  Activity,
  BedDouble,
  UserRound,
  Cpu,
} from 'lucide-react';

import {
  INITIAL_ALARMS,
  PUMP_TROUBLESHOOTING_DATABASE,
} from '../data/mockData';

import {
  Alarm,
  PumpAlarmCategory,
  PumpTroubleshootingGuide,
} from '../types/icu';

const MODELS = [
  'Alaris GP Guardrails Plus (Simulated)',
  'Baxter Spectrum IQ (Simulated)',
  'B. Braun Infusomat Space (Simulated)',
  'Fresenius Agilia (Simulated)',
  'Generic / Custom Unverified Model',
];

const CATEGORIES: PumpAlarmCategory[] = [
  'Occlusion',
  'Low battery',
  'Empty fluid container',
  'Door or cassette not properly secured',
  'Air-in-line',
  'Unknown / Unverified',
];

const GENERAL_GUIDANCE: Record<
  Exclude<PumpAlarmCategory, 'Unknown / Unverified'>,
  { causes: string[]; steps: string[]; escalation: string }
> = {
  Occlusion: {
    causes: [
      'Tubing may be kinked, compressed, or obstructed.',
      'A clamp or connection may need inspection.',
      'The patient access site may require clinical assessment.',
    ],
    steps: [
      'Assess the patient and check for immediate deterioration.',
      'Inspect visible tubing and connections for kinks, compression, leakage, or disconnection.',
      'Follow the actual device instructions and hospital protocol.',
      'Ask trained clinical staff to assess the line before deciding whether the infusion can resume.',
    ],
    escalation:
      'Escalate promptly if the alarm persists, the patient deteriorates, or an important infusion may be interrupted.',
  },

  'Low battery': {
    causes: [
      'The pump may be running on battery power.',
      'The power cable or electrical supply may be disconnected.',
      'The battery may have reduced capacity.',
    ],
    steps: [
      'Assess the patient and the risk of interrupted medication delivery.',
      'Check the displayed battery status and power connection.',
      'Use only an approved power source and follow device instructions.',
      'Arrange an approved backup device if safe power cannot be restored.',
    ],
    escalation:
      'Immediately involve the clinical team if a critical infusion is at risk or the device cannot maintain power.',
  },

  'Empty fluid container': {
    causes: [
      'The fluid container may be empty or nearly empty.',
      'The programmed infusion volume may have been reached.',
      'The prescribed infusion may need review.',
    ],
    steps: [
      'Check the displayed alarm and fluid container.',
      'Confirm the current clinical order.',
      'Have authorised staff arrange a replacement if prescribed.',
      'Follow approved medication, aseptic, and device procedures before restarting.',
    ],
    escalation:
      'Escalate urgently if a critical medication may be interrupted or the replacement plan is unclear.',
  },

  'Door or cassette not properly secured': {
    causes: [
      'The pump door may not be securely latched.',
      'The administration set may be incorrectly seated.',
      'The latch or cassette mechanism may be damaged.',
    ],
    steps: [
      'Assess the patient and whether infusion delivery may have been interrupted.',
      'Check the displayed alarm and model-specific instructions.',
      'Never bypass a door interlock or force a damaged mechanism.',
      'Ask trained staff to inspect the set and device before use resumes.',
    ],
    escalation:
      'If the door cannot be secured or the mechanism is damaged, involve clinical and biomedical engineering staff.',
  },

  'Air-in-line': {
    causes: [
      'Air may be visible in the administration tubing.',
      'The container may be empty or a connection may be loose.',
      'The device may be detecting an air-related condition requiring assessment.',
    ],
    steps: [
      'Assess the patient and treat the alarm as a safety concern.',
      'Follow the actual pump instructions and hospital protocol.',
      'Do not bypass the air detector.',
      'Have trained staff assess the line and determine the appropriate corrective action.',
    ],
    escalation:
      'Immediately alert the clinical team if air may have entered the patient line, symptoms occur, or the alarm persists.',
  },
};

function inferCategory(alarm: Alarm): PumpAlarmCategory {
  const text =
    `${alarm.alarmCode} ${alarm.alarmDescription}`.toLowerCase();

  if (text.includes('occlusion')) return 'Occlusion';

  if (text.includes('battery') || text.includes('power')) {
    return 'Low battery';
  }

  if (
    text.includes('empty') ||
    text.includes('container') ||
    text.includes('fluid')
  ) {
    return 'Empty fluid container';
  }

  if (
    text.includes('door') ||
    text.includes('cassette') ||
    text.includes('latch')
  ) {
    return 'Door or cassette not properly secured';
  }

  if (text.includes('air-in-line') || text.includes('air detected')) {
    return 'Air-in-line';
  }

  return 'Unknown / Unverified';
}

export const PumpTroubleshootingView: React.FC = () => {
  const pumpAlarms = useMemo(
    () =>
      INITIAL_ALARMS.filter(
        (alarm) => alarm.deviceType === 'Infusion pump'
      ),
    []
  );

  const [selectedAlarmId, setSelectedAlarmId] = useState(
    pumpAlarms[0]?.id ?? ''
  );

  const selectedAlarm = useMemo(
    () =>
      pumpAlarms.find((alarm) => alarm.id === selectedAlarmId) ??
      pumpAlarms[0] ??
      null,
    [pumpAlarms, selectedAlarmId]
  );

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);

  const [selectedCategory, setSelectedCategory] =
    useState<PumpAlarmCategory>(
      pumpAlarms[0]
        ? inferCategory(pumpAlarms[0])
        : 'Unknown / Unverified'
    );

  const currentGuide = useMemo<PumpTroubleshootingGuide | null>(() => {
    if (
      selectedModel.includes('Generic / Custom') ||
      selectedCategory === 'Unknown / Unverified'
    ) {
      return null;
    }

    return (
      PUMP_TROUBLESHOOTING_DATABASE.find(
        (guide) =>
          guide.model === selectedModel &&
          guide.alarmCategory === selectedCategory
      ) ?? null
    );
  }, [selectedModel, selectedCategory]);

  const changeAlarm = (alarmId: string) => {
    setSelectedAlarmId(alarmId);

    const alarm = pumpAlarms.find((item) => item.id === alarmId);

    if (alarm) {
      setSelectedCategory(inferCategory(alarm));
    }
  };

  const generalGuidance =
    selectedCategory === 'Unknown / Unverified'
      ? null
      : GENERAL_GUIDANCE[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <Syringe className="h-5 w-5 text-teal-600" />
          Infusion Pump Troubleshooting
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Simulated pump alarms, bed context, and safety-focused guidance.
        </p>
      </header>

      

      {/* Alarm and bed context */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-600" />

          <h2 className="text-sm font-bold text-slate-900">
            Connected Alarm Context
          </h2>

          <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
            DEMO DATA
          </span>
        </div>

        {selectedAlarm ? (
          <>
            <label
              htmlFor="pump-alarm"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Select pump alarm
            </label>

            <select
              id="pump-alarm"
              value={selectedAlarm.id}
              onChange={(event) => changeAlarm(event.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
            >
              {pumpAlarms.map((alarm) => (
                <option key={alarm.id} value={alarm.id}>
                  {alarm.id} — {alarm.deviceId} — {alarm.alarmDescription}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                icon={<BedDouble className="h-4 w-4" />}
                label="ICU"
                value={selectedAlarm.patientId}
              />

              <InfoCard
                icon={<BedDouble className="h-4 w-4" />}
                label="Bed"
                value={selectedAlarm.bedNumber}
              />

              <InfoCard
                icon={<UserRound className="h-4 w-4" />}
                label="Patient"
                value={selectedAlarm.patientName}
              />

              <InfoCard
                icon={<Cpu className="h-4 w-4" />}
                label="Device ID"
                value={selectedAlarm.deviceId}
              />
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Selected alarm
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-900">
                {selectedAlarm.alarmDescription}
              </p>

              <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                  Code: {selectedAlarm.alarmCode}
                </span>
                
<span
  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-bold ring-1 ${
    selectedAlarm.severity.toLowerCase() === 'high'
      ? 'bg-red-100 text-red-800 ring-red-300'
      : selectedAlarm.severity.toLowerCase() === 'critical'
        ? 'bg-red-200 text-red-950 ring-red-400'
        : 'bg-white text-slate-600 ring-slate-200'
  }`}
>
  {['high', 'critical'].includes(
    selectedAlarm.severity.toLowerCase()
  ) && (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
    </span>
  )}

  Severity: {selectedAlarm.severity}
</span>

                

                <span className="rounded bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-200">
                  Status: {selectedAlarm.status}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">
            No infusion pump alarms are present in the current demo dataset.
          </p>
        )}
      </section>

      {/* Configuration */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">
          Troubleshooting Configuration
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Select a simulated pump model and alarm category.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="pump-model"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Simulated Pump Model
            </label>

            <select
              id="pump-model"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
            >
              {MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pump-category"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Alarm Category
            </label>

            <select
              id="pump-category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value as PumpAlarmCategory
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Exact database match */}
      {currentGuide ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-1 font-mono text-[10px] font-bold text-slate-800">
                {currentGuide.alarmCode}
              </span>

              <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-900">
                {currentGuide.urgency}
              </span>

              <span className="text-[10px] text-slate-500">
                {currentGuide.alarmCategory}
              </span>
            </div>

            <h2 className="mt-3 text-base font-bold text-slate-900">
              {currentGuide.alarmName}
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Simulated model: {currentGuide.model}
            </p>

            <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-teal-700">
              <BookOpen className="h-3.5 w-3.5" />
              Demo database match — verify against the actual device manual
            </p>
          </div>

          <div className="space-y-6 p-5">
            <GuidanceList
              title="Possible Causes"
              items={currentGuide.possibleCauses}
              icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            />

            <GuidanceList
              title="Safety Checks & Workflow"
              items={currentGuide.safeChecksSteps}
              icon={<CheckCircle2 className="h-4 w-4 text-teal-600" />}
              numbered
            />

            <EscalationPanel
              text={currentGuide.clinicalEscalationCriteria}
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Reference recorded in demo database
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {currentGuide.verifiedManualReference ??
                      'No reference recorded'}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {currentGuide.manualSection ?? 'No section recorded'}
                  </p>

                  <p className="mt-2 text-[10px] text-amber-800">
                    The reference text comes from the supplied demo data
                    and has not been independently verified here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : selectedCategory === 'Unknown / Unverified' ? (
        <section className="rounded-xl border border-amber-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Unverified alarm category
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                This alarm cannot be mapped confidently to a supported
                category. Check the actual device alarm and consult
                clinical or biomedical staff. Do not assume a procedure.
              </p>
            </div>
          </div>
        </section>
      ) : generalGuidance ? (
        <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="border-b border-amber-200 bg-amber-50 p-5">
            <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">
              General demo guidance
            </span>

            <h2 className="mt-3 text-base font-bold text-slate-900">
              {selectedCategory}
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              No exact model/category match exists in the supplied database.
              This is general safety guidance, not a manufacturer procedure.
            </p>
          </div>

          <div className="space-y-6 p-5">
            <GuidanceList
              title="Possible Causes"
              items={generalGuidance.causes}
              icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
            />

            <GuidanceList
              title="Safety Checks & Workflow"
              items={generalGuidance.steps}
              icon={<CheckCircle2 className="h-4 w-4 text-teal-600" />}
              numbered
            />

            <EscalationPanel text={generalGuidance.escalation} />
          </div>
        </section>
      ) : null}

      {/* Footer */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

        <p className="text-[10px] leading-relaxed text-slate-600">
          Demo only. This page does not control a real infusion pump or
          verify patient condition. Real device integration requires an
          authorised, validated interface and clinical safety review.
        </p>
      </div>
    </div>
  );
};

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function GuidanceList({
  title,
  items,
  icon,
  numbered = false,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  numbered?: boolean;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-900">
        {icon}
        {title}
      </h3>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
          >
            {numbered ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-[10px] font-bold text-teal-800">
                {index + 1}
              </span>
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            )}

            <p className="leading-relaxed text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EscalationPanel({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-950">
        <Wrench className="h-4 w-4 text-rose-600" />
        When to escalate
      </h3>

      <p className="text-xs leading-relaxed text-rose-900">{text}</p>
    </div>
  );
}
