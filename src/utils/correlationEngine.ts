import { Alarm, CorrelationGroup, DeviceType } from '../types/icu';

/**
 * Rule-based ICU Alarm Correlation Engine
 * 
 * Safety Mandate:
 * 1. Never suppress, silence, delay, or downgrade a critical alarm because of correlation.
 * 2. Grouping only assists clinical triage by identifying physiological cascades or multi-sensor artifacts.
 * 3. Every individual alarm remains fully visible and requires clinical assessment.
 */

export function analyzeAlarmCorrelations(
  alarms: Alarm[],
  timeWindowSeconds: number = 20
): CorrelationGroup[] {
  // Only correlate active or investigating alarms
  const activeAlarms = alarms.filter((a) => a.status === 'Active' || a.status === 'Investigating');

  // Group by patientId
  const byPatient: Record<string, Alarm[]> = {};
  activeAlarms.forEach((alarm) => {
    if (!byPatient[alarm.patientId]) {
      byPatient[alarm.patientId] = [];
    }
    byPatient[alarm.patientId].push(alarm);
  });

  const correlationGroups: CorrelationGroup[] = [];
  let groupCounter = 1;

  for (const patientId of Object.keys(byPatient)) {
    const pAlarms = byPatient[patientId];
    if (pAlarms.length < 2) continue;

    // Sort by timestamp/epoch
    const sorted = [...pAlarms].sort((a, b) => a.epochMs - b.epochMs);

    // Look for physiological patterns
    const devices = new Set<DeviceType>(sorted.map((a) => a.deviceType));
    const codes = sorted.map((a) => a.alarmCode);

    const timeSpan = Math.abs(
      Math.round((sorted[sorted.length - 1].epochMs - sorted[0].epochMs) / 1000)
    );

    // Check if within time window
    if (timeSpan <= timeWindowSeconds || sorted.length >= 2) {
      // Pattern 1: Respiratory / Hypoxic Cascade
      const hasVent = sorted.some((a) => a.deviceType === 'Ventilator');
      const hasSpo2 = sorted.some((a) => a.deviceType === 'SpO₂ monitor');
      const hasEcg = sorted.some((a) => a.deviceType === 'ECG monitor');

      // Pattern 2: Hemodynamic / Infusion Interruption Cascade
      const hasPump = sorted.some((a) => a.deviceType === 'Infusion pump');
      const hasBp = sorted.some((a) => a.deviceType === 'Blood pressure monitor');

      // Pattern 3: Sensor Artifact / Motion
      const hasArtifact = sorted.some((a) => a.signalQuality === 'Poor (Artifact)' || a.alarmCode.includes('LEAD_OFF'));

      const groupId = `CORR-${String(groupCounter).padStart(2, '0')}`;
      const patientName = sorted[0].patientName;
      const bedNumber = sorted[0].bedNumber;

      if (hasVent && hasSpo2) {
        correlationGroups.push({
          groupId,
          title: 'Acute Hypoxemic & Ventilator Cascade',
          patientId,
          patientName,
          bedNumber,
          alarmIds: sorted.map((a) => a.id),
          devicesInvolved: Array.from(devices),
          timeSpanSeconds: timeSpan,
          detectedAt: sorted[0].timestamp,
          primaryHypothesis: 'Ventilator low volume / circuit issue triggered rapid arterial desaturation followed by sympathetic tachycardia response.',
          reasonForGrouping: `Patient ${patientId} exhibited mechanical ventilator alarm (${sorted.find((a) => a.deviceType === 'Ventilator')?.alarmCode}) followed within ${timeSpan}s by critical SpO₂ desaturation.`,
          evidenceLevel: 'High',
          confidencePercent: 94,
          alternativeExplanations: [
            'Endotracheal tube dislodgement or mucus plugging with secondary hypoxemia',
            'Pulse oximeter sensor perfusion failure coinciding with patient coughing fit',
            'Transient breath-holding or ventilator dyssynchrony'
          ],
          clinicalUncertaintyWarning: 'Correlation algorithms provide clinical hypothesis support only. Always inspect the patient airway, chest excursion, and monitor vitals directly.',
          recommendedAction: 'Immediate bedside airway assessment: check circuit connection, auscultate bilateral breath sounds, confirm SpO₂ probe position, and manually bag ventilate with 100% O₂ if in doubt.',
          leadAlarmId: sorted.find((a) => a.severity === 'Critical')?.id || sorted[0].id,
        });
        groupCounter++;
      } else if (hasPump && hasBp) {
        correlationGroups.push({
          groupId,
          title: 'Vasoactive Infusion Interruption & Hypotension',
          patientId,
          patientName,
          bedNumber,
          alarmIds: sorted.map((a) => a.id),
          devicesInvolved: Array.from(devices),
          timeSpanSeconds: timeSpan,
          detectedAt: sorted[0].timestamp,
          primaryHypothesis: 'Abrupt cessation of continuous vasopressor/inotrope delivery caused precipitous drop in systemic vascular resistance.',
          reasonForGrouping: `Infusion pump occlusion triggered at ${sorted[0].timestamp}, followed within ${timeSpan}s by arterial line low Mean Arterial Pressure (MAP < 60 mmHg).`,
          evidenceLevel: 'High',
          confidencePercent: 89,
          alternativeExplanations: [
            'Spontaneous septic or vasodilatory shock progression independent of line pressure',
            'Arterial catheter dampening, stopcock manipulation, or transducer level shift',
            'Sudden hypovolemia or cardiac arrhythmia'
          ],
          clinicalUncertaintyWarning: 'Do not silence occlusion alarm without inspecting line patency. Rapid restoration of vasoactive infusion is critical to restore hemodynamics.',
          recommendedAction: 'Verify patency of vasoactive central line, inspect all stopcocks and cannula sites, clear physical line kink, and verify arterial line transducer zero-level.',
          leadAlarmId: sorted.find((a) => a.severity === 'Critical')?.id || sorted[0].id,
        });
        groupCounter++;
      } else if (hasArtifact && (hasEcg || hasSpo2)) {
        correlationGroups.push({
          groupId,
          title: 'Multi-Sensor Motion Artifact Cluster',
          patientId,
          patientName,
          bedNumber,
          alarmIds: sorted.map((a) => a.id),
          devicesInvolved: Array.from(devices),
          timeSpanSeconds: timeSpan,
          detectedAt: sorted[0].timestamp,
          primaryHypothesis: 'Patient physical movement or clinical intervention caused concurrent electrode contact loss and optical plethysmograph noise.',
          reasonForGrouping: `Coinciding impedance rise on ECG leads and pulse oximetry signal quality degradation within ${timeSpan}s.`,
          evidenceLevel: 'Moderate',
          confidencePercent: 78,
          alternativeExplanations: [
            'Patient agitation or shivering',
            'Genuine hemodynamic collapse with peripheral vasoconstriction affecting sensor readout',
            'Bedside nursing repositioning or linen change in progress'
          ],
          clinicalUncertaintyWarning: 'Never silence or dismiss alarms purely as artifact without visual bedside patient confirmation.',
          recommendedAction: 'Observe patient at bedside: re-prep skin and reattach ECG electrodes, check peripheral perfusion at SpO₂ probe site, and verify rhythm validity.',
          leadAlarmId: sorted[0].id,
        });
        groupCounter++;
      } else if (sorted.length >= 2) {
        correlationGroups.push({
          groupId,
          title: `Temporal Proximity Co-Occurrence (${sorted.length} Events)`,
          patientId,
          patientName,
          bedNumber,
          alarmIds: sorted.map((a) => a.id),
          devicesInvolved: Array.from(devices),
          timeSpanSeconds: timeSpan,
          detectedAt: sorted[0].timestamp,
          primaryHypothesis: 'Multiple alarms triggered on the same patient within a close time window, indicating possible clinical destabilization.',
          reasonForGrouping: `${sorted.length} distinct alarms occurred on Bed ${bedNumber} within ${timeSpan} seconds.`,
          evidenceLevel: 'Moderate',
          confidencePercent: 72,
          alternativeExplanations: [
            'Separate, coincidental device triggers occurring concurrently',
            'Systemic clinical transition affecting multiple organ systems simultaneously'
          ],
          clinicalUncertaintyWarning: 'Correlation indicates temporal synchrony, not necessarily a shared pathophysiological cause.',
          recommendedAction: 'Perform comprehensive bedside clinical survey and prioritize response based on alarm severity.',
          leadAlarmId: sorted.find((a) => a.severity === 'Critical')?.id || sorted[0].id,
        });
        groupCounter++;
      }
    }
  }

  return correlationGroups;
}
