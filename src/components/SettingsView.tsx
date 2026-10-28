import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BedDouble,
  CheckCircle2,
  Clock3,
  Droplets,
  Heart,
  Info,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Wind,
  Play,
} from 'lucide-react';

import {
  playCriticalAlarmSound,
  playWarningSound,
  setMasterVolume,
  getMasterVolume,
} from '../utils/audio';

import type { DeviceType, Severity } from '../types/icu';

interface SettingsViewProps {
  audioMuted: boolean;
  onToggleAudio: () => void;
  timeWindowSeconds: number;
  onChangeTimeWindow: (sec: number) => void;
  onInjectCustomAlarm: (alarm: {
    patientId: string;
    deviceType: DeviceType;
    severity: Severity;
    alarmDescription: string;
    alarmCode: string;
  }) => void;
  onResetSimulation: () => void;
}

type VitalSet = {
  hr: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  rr: number;
  temp: number;
};

type PatientBed = {
  id: string;
  name: string;
  vitals: VitalSet;
};

type AlarmLevel = 'Critical' | 'High';

type AlarmItem = {
  id: string;
  bedId: string;
  title: string;
  value: string;
  level: AlarmLevel;
  message: string;
};

type HistoryItem = {
  id: string;
  time: string;
  bedId: string;
  title: string;
  value: string;
  level: AlarmLevel;
};
type TelemetrySnapshot = {
  timestamp: number;
  beds: PatientBed[];
};

const INITIAL_BEDS: PatientBed[] = [
  {
    id: 'ICU-01',
    name: 'Patient 01',
    vitals: { hr: 82, spo2: 97, systolic: 118, diastolic: 76, rr: 16, temp: 37.0 },
  },
  {
    id: 'ICU-02',
    name: 'Patient 02',
    vitals: { hr: 106, spo2: 94, systolic: 104, diastolic: 65, rr: 22, temp: 37.2 },
  },
  {
    id: 'ICU-03',
    name: 'Patient 03',
    vitals: { hr: 138, spo2: 84, systolic: 88, diastolic: 54, rr: 29, temp: 38.1 },
  },
  {
    id: 'ICU-04',
    name: 'Patient 04',
    vitals: { hr: 74, spo2: 96, systolic: 122, diastolic: 78, rr: 15, temp: 36.8 },
  },
  {
    id: 'ICU-05',
    name: 'Patient 05',
    vitals: { hr: 112, spo2: 91, systolic: 100, diastolic: 62, rr: 25, temp: 37.5 },
  },
];

const DEFAULT_THRESHOLDS = {
  spo2Critical: 85,
  spo2Warning: 90,
  hrHigh: 130,
  hrLow: 50,
  mapLow: 65,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const calculateMap = (systolic: number, diastolic: number) =>
  Math.round((systolic + 2 * diastolic) / 3);

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function Waveform({
  type,
  color,
}: {
  type: 'ecg' | 'spo2' | 'resp';
  color: string;
}) {
  const path = {
    ecg: 'M0 23 L24 23 L31 20 L37 25 L44 23 L61 23 L69 4 L77 39 L86 13 L94 23 L119 23 L126 20 L132 25 L139 23 L156 23 L164 4 L172 39 L181 13 L189 23 L220 23',
    spo2: 'M0 32 L15 32 Q22 32 28 19 T41 7 T54 26 T68 32 L86 32 Q93 32 99 19 T112 7 T125 26 T139 32 L157 32 Q164 32 170 19 T183 7 T196 26 T210 32 L220 32',
    resp: 'M0 28 Q20 28 30 8 T65 8 T100 28 T135 28 T170 8 T205 8 T220 28',
  }[type];

  return (
    <svg
      viewBox="0 0 220 44"
      className="w-full h-10 mt-2"
      aria-label={`${type} illustrative waveform`}
      role="img"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon,
  status = 'normal',
  children,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  children?: React.ReactNode;
}) {
  const colors = {
    normal: 'bg-slate-50 border-slate-200',
    warning: 'bg-amber-50 border-amber-300',
    critical: 'bg-rose-50 border-rose-300',
  };

  const valueColors = {
    normal: 'text-slate-900',
    warning: 'text-amber-800',
    critical: 'text-rose-800',
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[status]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {icon}
          {label}
        </span>
        {status !== 'normal' && (
          <AlertTriangle
            className={`w-3.5 h-3.5 ${
              status === 'critical' ? 'text-rose-600' : 'text-amber-600'
            }`}
          />
        )}
      </div>
      <div className={`font-mono tabular-nums text-2xl font-extrabold mt-2 ${valueColors[status]}`}>
        {value}
        {unit && <span className="text-xs font-semibold ml-1">{unit}</span>}
      </div>
      {children}
    </div>
  );
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  audioMuted,
  onToggleAudio,
  timeWindowSeconds,
  onChangeTimeWindow,
  onResetSimulation,
}) => {
  const [beds, setBeds] = useState<PatientBed[]>(() =>
    INITIAL_BEDS.map((bed) => ({
      ...bed,
      vitals: { ...bed.vitals },
      
    }))
  );

  const [selectedBed, setSelectedBed] = useState('ICU-03');
  const [search, setSearch] = useState('');
  const [running, setRunning] = useState(true);
  const [volume, setVolume] = useState(() =>
    Math.round(getMasterVolume() * 100)
  );
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [signalQuality, setSignalQuality] = useState<
    'Good' | 'Poor' | 'Disconnected'
  >('Good');

  const [acknowledgedKeys, setAcknowledgedKeys] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
const [telemetryHistory, setTelemetryHistory] = useState<TelemetrySnapshot[]>([]);
const [selectedHistoryTime, setSelectedHistoryTime] = useState('');


  const selectedPatient = beds.find((bed) => bed.id === selectedBed);
  const v = selectedPatient?.vitals;

  // Stable per-bed simulation. No actual medical device is connected.
  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setBeds((previous) =>
        previous.map((bed) => {
          const baseline = INITIAL_BEDS.find(
            (initial) => initial.id === bed.id
          )!.vitals;

          const drift = (
            current: number,
            target: number,
            step: number,
            min: number,
            max: number
          ) => {
            const delta = target - current;
            const random = (Math.random() - 0.5) * step;
            const movement = Math.abs(delta) < step ? random : Math.sign(delta) * step + random;
            return clamp(current + movement, min, max);
          };

          return {
            ...bed,
            vitals: {
              hr: Math.round(drift(bed.vitals.hr, baseline.hr, 2, 30, 220)),
              spo2: Math.round(drift(bed.vitals.spo2, baseline.spo2, 1, 70, 100)),
              systolic: Math.round(drift(bed.vitals.systolic, baseline.systolic, 2, 50, 240)),
              diastolic: Math.round(drift(bed.vitals.diastolic, baseline.diastolic, 1, 25, 150)),
              rr: Math.round(drift(bed.vitals.rr, baseline.rr, 1, 4, 60)),
              temp: Math.round(drift(bed.vitals.temp, baseline.temp, 0.1, 32, 42) * 10) / 10,
            },
          };
        })
      );
    }, 2000);

    return () => window.clearInterval(timer);
  }, [running]);
  
  // Save a timestamped snapshot whenever simulated vitals update.
  useEffect(() => {
    const timestamp = Date.now();

    const snapshot: TelemetrySnapshot = {
      timestamp,
      beds: beds.map((bed) => ({
        ...bed,
        vitals: { ...bed.vitals },
      })),
    };

    setTelemetryHistory((previous) =>
      [...previous, snapshot].slice(-600)
    );

    setSelectedHistoryTime((previous) => previous || String(timestamp));
  }, [beds]);


  const allAlarms = useMemo<AlarmItem[]>(() => {
    return beds.flatMap((bed) => {
      const current = bed.vitals;
      const map = calculateMap(current.systolic, current.diastolic);
      const alarms: AlarmItem[] = [];

      // A sensor fault is a technical alert, not a confirmed patient emergency.
      if (bed.id === selectedBed && signalQuality !== 'Good') {
        alarms.push({
          id: `${bed.id}-sensor-${signalQuality}`,
          bedId: bed.id,
          title: 'SpO₂ Sensor Signal',
          value: signalQuality,
          level: 'High',
          message:
            signalQuality === 'Poor'
              ? 'Poor signal quality simulated. Verify the sensor before interpreting the reading.'
              : 'Sensor disconnection simulated. SpO₂ is unavailable.',
        });

        return alarms;
      }

      if (current.spo2 <= thresholds.spo2Critical) {
        alarms.push({
          id: `${bed.id}-spo2-critical`,
          bedId: bed.id,
          title: 'Low SpO₂',
          value: `${current.spo2}%`,
          level: 'Critical',
          message: `Simulated SpO₂ is ${current.spo2}%, below the configured critical threshold.`,
        });
      } else if (current.spo2 <= thresholds.spo2Warning) {
        alarms.push({
          id: `${bed.id}-spo2-warning`,
          bedId: bed.id,
          title: 'SpO₂ Warning',
          value: `${current.spo2}%`,
          level: 'High',
          message: `Simulated SpO₂ is ${current.spo2}%, below the configured warning threshold.`,
        });
      }

      if (current.hr >= thresholds.hrHigh || current.hr <= thresholds.hrLow) {
        alarms.push({
          id: `${bed.id}-hr`,
          bedId: bed.id,
          title: 'Heart Rate Limit',
          value: `${current.hr} bpm`,
          level: 'Critical',
          message: `Simulated heart rate is ${current.hr} bpm, outside the configured limits.`,
        });
      }

      if (map < thresholds.mapLow) {
        alarms.push({
          id: `${bed.id}-map`,
          bedId: bed.id,
          title: 'Low Calculated MAP',
          value: `${map} mmHg`,
          level: 'Critical',
          message: `Calculated demo MAP is ${map} mmHg, below the configured threshold.`,
        });
      }

      return alarms;
    });
  }, [beds, thresholds, selectedBed, signalQuality]);

  const activeAlarms = allAlarms.filter((alarm) => alarm.bedId === selectedBed);
  const criticalActive = activeAlarms.some((alarm) => alarm.level === 'Critical');
  const activeKey = activeAlarms.map((alarm) => alarm.id).sort().join('|');
  const isAcknowledged =
    activeKey !== '' && acknowledgedKeys.includes(activeKey);

  // Record a new alarm-set transition in local demo history.
  useEffect(() => {
    if (!activeKey) return;

    setHistory((previous) => {
      const lastSetKey = previous[0]?.id;
      const historyKey = `${selectedBed}:${activeKey}`;

      if (lastSetKey === historyKey) return previous;

      const entries = activeAlarms.map((alarm) => ({
        id: historyKey,
        time: formatTime(),
        bedId: alarm.bedId,
        title: alarm.title,
        value: alarm.value,
        level: alarm.level,
      }));

      return [...entries, ...previous].slice(0, 30);
    });
  }, [activeKey, activeAlarms, selectedBed]);

  // Sound repeats only for the selected bed's unacknowledged alarm set.
  useEffect(() => {
    if (!activeKey || isAcknowledged || audioMuted) return;

    const play = () => {
      if (criticalActive) playCriticalAlarmSound();
      else playWarningSound();
    };

    play();
    const timer = window.setInterval(play, criticalActive ? 2500 : 5000);

    return () => window.clearInterval(timer);
  }, [activeKey, isAcknowledged, audioMuted, criticalActive]);

  const filteredBeds = beds.filter((bed) =>
    `${bed.id} ${bed.name}`.toLowerCase().includes(search.toLowerCase())
  );

  const updateThreshold = (
    key: keyof typeof DEFAULT_THRESHOLDS,
    value: number
  ) => {
    if (Number.isFinite(value)) {
      setThresholds((current) => ({ ...current, [key]: value }));
      setAcknowledgedKeys([]);
    }
  };

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setVolume(next);
    setMasterVolume(next / 100);
  };

  const acknowledge = () => {
    if (activeKey) {
      setAcknowledgedKeys((previous) =>
        previous.includes(activeKey) ? previous : [...previous, activeKey]
      );
    }
  };

  const reset = () => {
    setBeds(INITIAL_BEDS.map((bed) => ({
      ...bed,
      vitals: { ...bed.vitals },
    })));
    setSelectedBed('ICU-03');
    setSearch('');
    setRunning(true);
    setThresholds(DEFAULT_THRESHOLDS);
    setSignalQuality('Good');
    setAcknowledgedKeys([]);
    setHistory([]);
    onResetSimulation();
  };

  const map = v ? calculateMap(v.systolic, v.diastolic) : 0;

  return (
    <div className="max-w-6xl space-y-6">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-teal-600" />
            ICU Monitor & Correlation Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bedside telemetry preview, alarm controls and explainable alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
            SIMULATED DATA
          </span>
          <button
            type="button"
            onClick={() => setRunning((value) => !value)}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {running ? 'Pause Simulation' : 'Resume Simulation'}
          </button>
        </div>
      </header>

      {/* Ward bed selector */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-teal-600" />
            Bedside Monitor Selection
          </h2>
          <span className="text-xs text-slate-500">
            {beds.length} demo beds configured
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ICU bed or patient..."
            aria-label="Search ICU beds"
            className="w-full sm:max-w-md rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredBeds.map((bed) => {
            const bedAlarms = allAlarms.filter((alarm) => alarm.bedId === bed.id);
            const isCritical = bedAlarms.some((alarm) => alarm.level === 'Critical');
            const isHigh = bedAlarms.length > 0;

            return (
              <button
                type="button"
                key={bed.id}
                aria-pressed={selectedBed === bed.id}
                onClick={() => {
                  setSelectedBed(bed.id);
                  setAcknowledgedKeys([]);
                }}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  selectedBed === bed.id
                    ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50'
                    : isCritical
                    ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300'
                    : 'border-slate-200 bg-white hover:border-teal-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900">{bed.id}</span>
                  {isCritical ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : isHigh ? (
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{bed.name}</div>
                <div className="font-mono font-bold text-lg text-slate-800 mt-2">
                  {bed.vitals.hr}
                  <span className="text-[10px] font-medium text-slate-500 ml-1">bpm</span>
                </div>
                <div className={`text-[10px] font-semibold mt-1 ${
                  isCritical ? 'text-rose-700' : isHigh ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {isCritical ? 'Critical alarm' : isHigh ? 'Attention required' : 'No configured alarm'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected patient monitor */}
      {v && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Bedside Telemetry — {selectedBed}
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedPatient?.name} · Illustrative monitor signals
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              Signal quality
              <select
                value={signalQuality}
                onChange={(event) => {
                  setSignalQuality(event.target.value as typeof signalQuality);
                  setAcknowledgedKeys([]);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2"
              >
                <option value="Good">Good</option>
                <option value="Poor">Poor signal</option>
                <option value="Disconnected">Disconnected</option>
              </select>
            </label>
          </div>

          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Heart Rate"
              value={v.hr}
              unit="bpm"
              icon={<Heart className="w-3.5 h-3.5 text-rose-500" />}
              status={v.hr >= thresholds.hrHigh || v.hr <= thresholds.hrLow ? 'critical' : 'normal'}
            >
              <Waveform type="ecg" color="#059669" />
            </MetricCard>

            <MetricCard
              label="SpO₂"
              value={signalQuality === 'Disconnected' ? '--' : v.spo2}
              unit={signalQuality === 'Disconnected' ? '' : '%'}
              icon={<Droplets className="w-3.5 h-3.5 text-sky-600" />}
              status={
                signalQuality !== 'Good'
                  ? 'warning'
                  : v.spo2 <= thresholds.spo2Critical
                  ? 'critical'
                  : v.spo2 <= thresholds.spo2Warning
                  ? 'warning'
                  : 'normal'
              }
            >
              <Waveform type="spo2" color="#0284c7" />
              {signalQuality !== 'Good' && (
                <p className="text-[10px] text-amber-800 font-semibold">
                  {signalQuality === 'Poor' ? 'Signal unreliable' : 'Sensor disconnected'}
                </p>
              )}
            </MetricCard>

            <MetricCard
              label="Blood Pressure"
              value={`${v.systolic}/${v.diastolic}`}
              icon={<Activity className="w-3.5 h-3.5 text-sky-600" />}
              status={map < thresholds.mapLow ? 'critical' : 'normal'}
            >
              <p className="text-[10px] text-slate-600 mt-2">
                Calculated MAP: <strong>{map} mmHg</strong>
              </p>
            </MetricCard>

            <MetricCard
              label="Respiratory Rate"
              value={v.rr}
              unit="/min"
              icon={<Wind className="w-3.5 h-3.5 text-amber-600" />}
            >
              <Waveform type="resp" color="#d97706" />
              <p className="text-[10px] text-slate-500 mt-1">
                Temperature: {v.temp.toFixed(1)}°C
              </p>
            </MetricCard>
          </div>

         
        </section>
      )}
      
      {/* Historical patient vitals */}
      {(() => {
        const selectedSnapshot = telemetryHistory.find(
          (item) => String(item.timestamp) === selectedHistoryTime
        );

        const historicalPatient = selectedSnapshot?.beds.find(
          (bed) => bed.id === selectedBed
        );

        const previousSnapshot = selectedSnapshot
          ? [...telemetryHistory]
              .filter((item) => item.timestamp < selectedSnapshot.timestamp)
              .reverse()
              .find((item) => item.beds.some((bed) => bed.id === selectedBed))
          : undefined;

        const previousPatient = previousSnapshot?.beds.find(
          (bed) => bed.id === selectedBed
        );

        const historicalVitals = historicalPatient?.vitals;
        const currentVitals = selectedPatient?.vitals;

        const timeLabel = (timestamp: number) =>
          new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });

        const comparison = (
          current: number | undefined,
          old: number | undefined,
          unit: string
        ) => {
          if (current === undefined || old === undefined) return 'No earlier reading';
          const difference = Math.round((current - old) * 10) / 10;
          return difference === 0
            ? `No change (${unit})`
            : `${difference > 0 ? '+' : ''}${difference} ${unit}`;
        };

        return (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Clock3 className="h-4 w-4 text-teal-600" />
                  Patient Vitals Timeline
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedBed} · Select an earlier timestamp to review recorded demo readings
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="history-time" className="text-xs font-medium text-slate-600">
                  Recorded time
                </label>
                <select
                  id="history-time"
                  value={selectedHistoryTime}
                  onChange={(event) => setSelectedHistoryTime(event.target.value)}
                  className="max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {telemetryHistory.slice().reverse().map((item) => (
                    <option key={item.timestamp} value={String(item.timestamp)}>
                      {timeLabel(item.timestamp)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!historicalVitals || !currentVitals ? (
              <p className="p-5 text-sm text-slate-500">
                No historical reading available for this bed yet. Let the simulation run for a few seconds.
              </p>
            ) : (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800">
                      Selected historical reading
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {timeLabel(Number(selectedHistoryTime))}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      BP {historicalVitals.systolic}/{historicalVitals.diastolic} mmHg
                      {' · '}HR {historicalVitals.hr} bpm
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-800">
                      Current live simulation
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatTime()}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      BP {currentVitals.systolic}/{currentVitals.diastolic} mmHg
                      {' · '}HR {currentVitals.hr} bpm
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="p-3">Measurement</th>
                        <th className="p-3">Selected time</th>
                        <th className="p-3">Current</th>
                        <th className="p-3">Change vs previous sample</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        {
                          label: 'Blood Pressure',
                          oldValue: `${historicalVitals.systolic}/${historicalVitals.diastolic} mmHg`,
                          currentValue: `${currentVitals.systolic}/${currentVitals.diastolic} mmHg`,
                          change: previousPatient
                            ? comparison(
                                historicalVitals.systolic,
                                previousPatient.vitals.systolic,
                                'mmHg systolic'
                              )
                            : 'First saved sample',
                        },
                        {
                          label: 'Heart Rate',
                          oldValue: `${historicalVitals.hr} bpm`,
                          currentValue: `${currentVitals.hr} bpm`,
                          change: previousPatient
                            ? comparison(historicalVitals.hr, previousPatient.vitals.hr, 'bpm')
                            : 'First saved sample',
                        },
                        {
                          label: 'SpO₂',
                          oldValue: `${historicalVitals.spo2}%`,
                          currentValue: `${currentVitals.spo2}%`,
                          change: previousPatient
                            ? comparison(historicalVitals.spo2, previousPatient.vitals.spo2, '%')
                            : 'First saved sample',
                        },
                        {
                          label: 'Respiratory Rate',
                          oldValue: `${historicalVitals.rr}/min`,
                          currentValue: `${currentVitals.rr}/min`,
                          change: previousPatient
                            ? comparison(historicalVitals.rr, previousPatient.vitals.rr, '/min')
                            : 'First saved sample',
                        },
                        {
                          label: 'Temperature',
                          oldValue: `${historicalVitals.temp.toFixed(1)} °C`,
                          currentValue: `${currentVitals.temp.toFixed(1)} °C`,
                          change: previousPatient
                            ? comparison(historicalVitals.temp, previousPatient.vitals.temp, '°C')
                            : 'First saved sample',
                        },
                      ].map((row) => (
                        <tr key={row.label} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">{row.label}</td>
                          <td className="p-3 font-bold text-teal-800">{row.oldValue}</td>
                          <td className="p-3 font-bold text-blue-800">{row.currentValue}</td>
                          <td className="p-3 text-slate-600">{row.change}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                
              </div>
            )}
          </section>
        );
      })()}


      {/* Alarm status */}
      <section className={`rounded-xl border p-4 ${
        activeAlarms.length === 0
          ? 'bg-emerald-50 border-emerald-200'
          : criticalActive
          ? 'bg-rose-50 border-rose-300'
          : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            {activeAlarms.length === 0
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              : <AlertTriangle className={`w-5 h-5 shrink-0 ${criticalActive ? 'text-rose-600' : 'text-amber-600'}`} />
            }
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {activeAlarms.length === 0
                  ? 'No Configured Alarms Active'
                  : criticalActive
                  ? 'Critical Alarm — Review Required'
                  : 'High Priority / Technical Alert'}
              </h2>
              {activeAlarms.length === 0 ? (
                <p className="text-xs text-slate-600 mt-1">
                  No configured threshold is currently triggered for {selectedBed}.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {activeAlarms.map((alarm) => (
                    <div key={alarm.id} className="text-xs text-slate-700">
                      <span className={`inline-block rounded border px-1.5 py-0.5 mr-2 text-[10px] font-bold ${
                        alarm.level === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {alarm.level}
                      </span>
                      <strong>{alarm.title} · {alarm.value}</strong>
                      <p className="mt-1">{alarm.message}</p>
                    </div>
                  ))}
                  {isAcknowledged && (
                    <p className="text-[11px] text-teal-800 font-semibold">
                      Acknowledged in the demo. The alarm condition remains visible.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {activeAlarms.length > 0 && !isAcknowledged && (
            <button
              type="button"
              onClick={() => {
                setAcknowledgedKeys((previous) => [...previous, activeKey]);
              }}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 shrink-0"
            >
              Acknowledge
            </button>
          )}
        </div>
      </section>

      {/* Audio */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-600" />
          Alarm Audio Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-700">Master alarm audio</span>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  audioMuted ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 text-white'
                }`}
              >
                {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {audioMuted ? 'Muted' : 'Sound Enabled'}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <label htmlFor="alarm-volume">Alert volume</label>
                <span className="font-mono font-bold">{volume}%</span>
              </div>
              <input
                id="alarm-volume"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setVolume(next);
                  setMasterVolume(next / 100);
                }}
                disabled={audioMuted}
                className="w-full accent-teal-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-700">Test alarm sounds</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={audioMuted}
                onClick={playCriticalAlarmSound}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" /> Critical Tone
              </button>
              <button
                type="button"
                disabled={audioMuted}
                onClick={playWarningSound}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" /> Warning Tone
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Critical tones take priority over warnings in this demo. Actual tone design is controlled by your audio utilities.
            </p>
          </div>
        </div>
      </section>

      {/* Thresholds */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          Physiological Thresholds — Demo Configuration
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {([
            ['spo2Critical', 'SpO₂ Critical (%)'],
            ['spo2Warning', 'SpO₂ Warning (%)'],
            ['hrHigh', 'HR High (bpm)'],
            ['hrLow', 'HR Low (bpm)'],
            ['mapLow', 'MAP Low (mmHg)'],
          ] as const).map(([key, label]) => (
            <label key={key} className="text-xs text-slate-600">
              <span className="block mb-1">{label}</span>
              <input
                type="number"
                value={thresholds[key]}
                onChange={(event) => updateThreshold(key, Number(event.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-teal-500"
              />
            </label>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Values are configurable demo thresholds, not validated clinical recommendations.
        </p>
      </section>

      {/* Correlation */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          Alarm Correlation Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Temporal proximity window
            </label>
            <div className="flex gap-2">
              {[5, 10, 20, 30].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => onChangeTimeWindow(seconds)}
                  aria-pressed={timeWindowSeconds === seconds}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold ${
                    timeWindowSeconds === seconds
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-teal-600" />
              Current window: {timeWindowSeconds} seconds
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              This control updates the configured window. Grouping alarms across devices requires your separate correlation engine.
            </p>
          </div>
        </div>
      </section>

      {/* Event history */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            Recent Alarm Events
          </h2>
          <span className="text-[10px] text-slate-500">Local demo history</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500">No alarm events recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((event, index) => (
              <div
                key={`${event.id}-${event.time}-${index}`}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {event.bedId} · {event.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{event.value}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    event.level === 'Critical'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {event.level}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reset */}
      <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Reset Entire Simulation
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Restore demo readings, thresholds and event history.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </section>

      <p className="text-[11px] text-slate-500">
        Educational simulation only. No real medical devices or patient feeds are connected.
        Synthetic readings and illustrative waveforms must not be used for clinical decisions.
      </p>
    </div>
  );
};