/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LiveAlarmsView } from './components/LiveAlarmsView';
import { CorrelationAnalysisView } from './components/CorrelationAnalysisView';
import { PumpTroubleshootingView } from './components/PumpTroubleshootingView';
import { AlarmTimelineView } from './components/AlarmTimelineView';
import { WardOverviewView } from './components/WardOverviewView';
import { EventHistoryView } from './components/EventHistoryView';
import { SettingsView } from './components/SettingsView';
import { AlarmDetailModal } from './components/AlarmDetailModal';
import { ScenarioModal } from './components/ScenarioModal';

import { Alarm, ICUPatient, DeviceType, Severity } from './types/icu';
import { INITIAL_ALARMS, INITIAL_PATIENTS } from './data/mockData';
import { analyzeAlarmCorrelations } from './utils/correlationEngine';
import {
  getAudioMuted,
  setAudioMuted,
  playCriticalAlarmSound,
  playWarningSound,
  playAcknowledgeSound,
} from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [alarms, setAlarms] = useState<Alarm[]>(INITIAL_ALARMS);
  const [patients, setPatients] = useState<ICUPatient[]>(INITIAL_PATIENTS);
  const [timeWindowSeconds, setTimeWindowSeconds] = useState<number>(20);
  const [selectedCorrelationGroupId, setSelectedCorrelationGroupId] = useState<string | null>(null);

  // Modal states
  const [inspectingAlarm, setInspectingAlarm] = useState<Alarm | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  // Audio & Simulation state
  const [audioMuted, setAudioMutedState] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());

  // Compute live correlation groups
  const correlationGroups = useMemo(() => {
    return analyzeAlarmCorrelations(alarms, timeWindowSeconds);
  }, [alarms, timeWindowSeconds]);

  // Synchronize alarm correlation IDs
  useEffect(() => {
    setAlarms((prev) => {
      let modified = false;
      const next = prev.map((a) => {
        const group = correlationGroups.find((g) => g.alarmIds.includes(a.id));
        const newGroupId = group ? group.groupId : undefined;
        if (a.correlationGroupId !== newGroupId) {
          modified = true;
          return { ...a, correlationGroupId: newGroupId };
        }
        return a;
      });
      return modified ? next : prev;
    });
  }, [correlationGroups]);

  // Simulated live clock ticker
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimulatedDate((prev) => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const formattedSimulatedTime = useMemo(() => {
    return simulatedDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [simulatedDate]);

  // Audio toggle
  const handleToggleAudio = useCallback(() => {
    const next = !audioMuted;
    setAudioMutedState(next);
    setAudioMuted(next);
    if (!next) {
      playWarningSound();
    }
  }, [audioMuted]);

  // Acknowledge alarm
  const handleAcknowledgeAlarm = useCallback((alarmId: string, note?: string) => {
    playAcknowledgeSound();
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === alarmId) {
          return {
            ...a,
            status: 'Acknowledged',
            acknowledgedBy: 'RN Attending',
            acknowledgedAt: formattedSimulatedTime,
            clinicalNote: note || a.clinicalNote,
          };
        }
        return a;
      })
    );
  }, [formattedSimulatedTime]);

  // Resolve alarm
  const handleResolveAlarm = useCallback((alarmId: string) => {
    playAcknowledgeSound();
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === alarmId) {
          return {
            ...a,
            status: 'Resolved',
          };
        }
        return a;
      })
    );
  }, []);

  // View correlation from any screen
  const handleNavigateToCorrelation = useCallback((groupId?: string) => {
    if (groupId) {
      setSelectedCorrelationGroupId(groupId);
    }
    setCurrentTab('correlation');
  }, []);

  // Load Preset Scenarios
  const handleLoadScenario = useCallback((scenarioType: string) => {
    const now = Date.now();
    const timeStr = formattedSimulatedTime;

    if (scenarioType === 'hypoxia_cascade') {
      playCriticalAlarmSound();
      // Patient ICU-02 severe ARDS cascade
      const newCascadeAlarms: Alarm[] = [
        {
          id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: timeStr,
          date: '2026-10-26',
          epochMs: now - 14000,
          patientId: 'ICU-02',
          bedNumber: 'Bed 02',
          patientName: 'Marcus Reed',
          deviceId: 'VENT-402',
          deviceType: 'Ventilator',
          alarmCode: 'VENT_DISCONNECT',
          alarmDescription: 'Patient Airway Disconnected / Zero Minute Volume',
          severity: 'Critical',
          signalQuality: 'Excellent',
          status: 'Active',
          valueObserved: '0.0 L/min',
          threshold: 'Min: 4.5 L/min',
        },
        {
          id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: timeStr,
          date: '2026-10-26',
          epochMs: now - 6000,
          patientId: 'ICU-02',
          bedNumber: 'Bed 02',
          patientName: 'Marcus Reed',
          deviceId: 'SPO2-402',
          deviceType: 'SpO₂ monitor',
          alarmCode: 'SPO2_DESAT_CRIT',
          alarmDescription: 'Severe Hypoxemia (SpO₂ plummeted to 76%)',
          severity: 'Critical',
          signalQuality: 'Good',
          status: 'Active',
          valueObserved: '76%',
          threshold: '< 88%',
        },
        {
          id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: timeStr,
          date: '2026-10-26',
          epochMs: now,
          patientId: 'ICU-02',
          bedNumber: 'Bed 02',
          patientName: 'Marcus Reed',
          deviceId: 'ECG-402',
          deviceType: 'ECG monitor',
          alarmCode: 'ECG_EXTREME_TACHY',
          alarmDescription: 'Extreme Sinus Tachycardia (HR 154 bpm sympathetic shock)',
          severity: 'High',
          signalQuality: 'Good',
          status: 'Active',
          valueObserved: '154 bpm',
          threshold: '> 130 bpm',
        },
      ];

      setAlarms((prev) => [...newCascadeAlarms, ...prev]);
      setPatients((prev) =>
        prev.map((p) =>
          p.bedId === 'ICU-02'
            ? {
                ...p,
                acuityLevel: 'Critical',
                vitals: {
                  ...p.vitals,
                  heartRate: 154,
                  hrStatus: 'high',
                  spo2: 76,
                  spo2Status: 'critical',
                  respRate: 34,
                  rrStatus: 'high',
                },
              }
            : p
        )
      );
    } else if (scenarioType === 'pump_occlusion_cascade') {
      playCriticalAlarmSound();
      const pumpAlarms: Alarm[] = [
        {
          id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: timeStr,
          date: '2026-10-26',
          epochMs: now - 8000,
          patientId: 'ICU-04',
          bedNumber: 'Bed 04',
          patientName: 'David Chen',
          deviceId: 'PUMP-404-A',
          deviceType: 'Infusion pump',
          alarmCode: 'PUMP_OCCLUSION_DOWN',
          alarmDescription: 'Downstream Pressure Exceeded (Noradrenaline Line Occlusion)',
          severity: 'High',
          signalQuality: 'Excellent',
          status: 'Active',
          valueObserved: '850 mmHg',
          threshold: 'Max: 500 mmHg',
        },
        {
          id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
          timestamp: timeStr,
          date: '2026-10-26',
          epochMs: now,
          patientId: 'ICU-04',
          bedNumber: 'Bed 04',
          patientName: 'David Chen',
          deviceId: 'ART-BP-404',
          deviceType: 'Blood pressure monitor',
          alarmCode: 'ART_SHOCK_MAP',
          alarmDescription: 'Profound Hypotensive Shock (MAP 52 mmHg / 68/44)',
          severity: 'Critical',
          signalQuality: 'Excellent',
          status: 'Active',
          valueObserved: 'MAP 52 mmHg',
          threshold: 'MAP < 65 mmHg',
        },
      ];
      setAlarms((prev) => [...pumpAlarms, ...prev]);
      setPatients((prev) =>
        prev.map((p) =>
          p.bedId === 'ICU-04'
            ? {
                ...p,
                acuityLevel: 'Critical',
                vitals: {
                  ...p.vitals,
                  bloodPressure: { systolic: 68, diastolic: 44, map: 52 },
                  bpStatus: 'critical',
                },
              }
            : p
        )
      );
    } else if (scenarioType === 'sensor_artifact') {
      playWarningSound();
      const artifactAlarm: Alarm = {
        id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: timeStr,
        date: '2026-10-26',
        epochMs: now,
        patientId: 'ICU-01',
        bedNumber: 'Bed 01',
        patientName: 'Eleanor Vance',
        deviceId: 'ECG-401',
        deviceType: 'ECG monitor',
        alarmCode: 'ECG_MOTION_ARTIFACT',
        alarmDescription: 'Excessive Lead Noise & Motion Artifact during Repositioning',
        severity: 'Medium',
        signalQuality: 'Poor (Artifact)',
        status: 'Active',
        valueObserved: 'Artifact Noise > 70%',
        threshold: 'Max: 20%',
      };
      setAlarms((prev) => [artifactAlarm, ...prev]);
    } else if (scenarioType === 'resolve_all') {
      playAcknowledgeSound();
      setAlarms((prev) =>
        prev.map((a) => ({
          ...a,
          status: 'Resolved',
        }))
      );
      setPatients(INITIAL_PATIENTS);
    }
  }, [formattedSimulatedTime]);

  // Inject manual alarm
  const handleInjectCustomAlarm = useCallback((custom: {
    patientId: string;
    deviceType: DeviceType;
    severity: Severity;
    alarmDescription: string;
    alarmCode: string;
  }) => {
    if (custom.severity === 'Critical') {
      playCriticalAlarmSound();
    } else {
      playWarningSound();
    }

    const patient = patients.find((p) => p.bedId === custom.patientId);
    const newAlarm: Alarm = {
      id: `ALM-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: formattedSimulatedTime,
      date: '2026-10-26',
      epochMs: Date.now(),
      patientId: custom.patientId,
      bedNumber: `Bed ${custom.patientId.replace('ICU-', '')}`,
      patientName: patient ? patient.name : 'Unknown Patient',
      deviceId: `${custom.deviceType.slice(0, 3).toUpperCase()}-${custom.patientId.replace('ICU-', '40')}`,
      deviceType: custom.deviceType,
      alarmCode: custom.alarmCode,
      alarmDescription: custom.alarmDescription,
      severity: custom.severity,
      signalQuality: 'Good',
      status: 'Active',
    };

    setAlarms((prev) => [newAlarm, ...prev]);
  }, [formattedSimulatedTime, patients]);

  // Reset simulation to original baseline
  const handleResetSimulation = useCallback(() => {
    setAlarms(INITIAL_ALARMS);
    setPatients(INITIAL_PATIENTS);
    playAcknowledgeSound();
  }, []);

  // Compute active counts for badges
  const activeAlarmsCount = alarms.filter(
    (a) => a.status === 'Active' || a.status === 'Investigating'
  ).length;

  const criticalAlarmsCount = alarms.filter(
    (a) => (a.status === 'Active' || a.status === 'Investigating') && a.severity === 'Critical'
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Top Header */}
      <Header
        simulatedTime={formattedSimulatedTime}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        audioMuted={audioMuted}
        onToggleAudio={handleToggleAudio}
        criticalAlarmCount={criticalAlarmsCount}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onResetSimulation={handleResetSimulation}
      />

      {/* Main Layout: Dark Navy Sidebar + Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Dark Navy Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeAlarmCount={activeAlarmsCount}
          correlationGroupCount={correlationGroups.length}
          criticalCount={criticalAlarmsCount}
        />

        {/* Viewport Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                alarms={alarms}
                correlationGroups={correlationGroups}
                patients={patients}
                onAcknowledgeAlarm={handleAcknowledgeAlarm}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
                onNavigateToCorrelation={handleNavigateToCorrelation}
                onNavigateToLiveAlarms={() => setCurrentTab('live-alarms')}
                onNavigateToWard={() => setCurrentTab('ward-overview')}
              />
            )}

            {currentTab === 'live-alarms' && (
              <LiveAlarmsView
                alarms={alarms}
                onAcknowledgeAlarm={handleAcknowledgeAlarm}
                onResolveAlarm={handleResolveAlarm}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
                onNavigateToCorrelation={handleNavigateToCorrelation}
              />
            )}

            {currentTab === 'correlation' && (
              <CorrelationAnalysisView
                correlationGroups={correlationGroups}
                allAlarms={alarms}
                selectedGroupId={selectedCorrelationGroupId}
                onSelectGroup={(id) => setSelectedCorrelationGroupId(id)}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
                onAcknowledgeAlarm={handleAcknowledgeAlarm}
                timeWindowSeconds={timeWindowSeconds}
                onChangeTimeWindow={(sec) => setTimeWindowSeconds(sec)}
              />
            )}

            {currentTab === 'pump-troubleshooting' && (
              <PumpTroubleshootingView />
            )}

            {currentTab === 'timeline' && (
              <AlarmTimelineView
                alarms={alarms}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
                onNavigateToCorrelation={handleNavigateToCorrelation}
              />
            )}

            {currentTab === 'ward-overview' && (
              <WardOverviewView
                patients={patients}
                alarms={alarms}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
                onAcknowledgeAlarm={handleAcknowledgeAlarm}
                onNavigateToCorrelation={handleNavigateToCorrelation}
              />
            )}

            {currentTab === 'event-history' && (
              <EventHistoryView
                alarms={alarms}
                onViewAlarmDetails={(alarm) => setInspectingAlarm(alarm)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                audioMuted={audioMuted}
                onToggleAudio={handleToggleAudio}
                timeWindowSeconds={timeWindowSeconds}
                onChangeTimeWindow={(sec) => setTimeWindowSeconds(sec)}
                onInjectCustomAlarm={handleInjectCustomAlarm}
                onResetSimulation={handleResetSimulation}
              />
            )}
          </div>
        </main>
      </div>

      {/* Detail / Waveform Inspection Modal */}
      <AlarmDetailModal
        alarm={inspectingAlarm}
        onClose={() => setInspectingAlarm(null)}
        onAcknowledge={handleAcknowledgeAlarm}
        onResolve={handleResolveAlarm}
        onNavigateToCorrelation={handleNavigateToCorrelation}
      />

      {/* Scenario Trigger Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onLoadScenario={handleLoadScenario}
      />

    </div>
  );
}
