import React from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Activity,
  Wind,
  Syringe,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScenario: (scenarioType: string) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onLoadScenario,
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'hypoxia_cascade',
      title: 'Scenario 1: Acute Hypoxia & Ventilator Cascade',
      patient: 'ICU-02 · Marcus Reed (Severe ARDS)',
      devices: 'Ventilator → SpO₂ Monitor → ECG Monitor',
      icon: Wind,
      color: 'bg-rose-50 border-rose-300 text-rose-900',
      badge: 'Critical Emergency',
      description:
        'Simulates an abrupt ventilator circuit disconnect leading within 8 seconds to severe arterial desaturation (SpO₂ 81%) and compensatory sinus tachycardia (HR 138 bpm). Demonstrates multi-device correlation grouping.',
    },
    {
      id: 'pump_occlusion_cascade',
      title: 'Scenario 2: Vasoactive Infusion Occlusion & Shock',
      patient: 'ICU-04 · David Chen (Cardiogenic Shock)',
      devices: 'Infusion Pump → Arterial Blood Pressure Monitor',
      icon: Syringe,
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      badge: 'Hemodynamic Cascade',
      description:
        'Simulates downstream occlusion on continuous Noradrenaline infusion line, causing rapid blood pressure collapse (MAP dropping to 58 mmHg).',
    },
    {
      id: 'sensor_artifact',
      title: 'Scenario 3: Sensor Motion Artifact / Repositioning',
      patient: 'ICU-01 · Eleanor Vance (Post-CABG)',
      devices: 'ECG Monitor (Lead V2 Off) + SpO₂ Noise',
      icon: Activity,
      color: 'bg-sky-50 border-sky-300 text-sky-900',
      badge: 'Signal Quality Artifact',
      description:
        'Simulates high electrode impedance and optical plethysmography noise during patient repositioning, producing non-hemodynamic warning alerts with poor signal quality flag.',
    },
    {
      id: 'resolve_all',
      title: 'Scenario 4: All Clear / Normal Ward State',
      patient: 'All 5 ICU Beds (ICU-01 to ICU-05)',
      devices: 'All Monitored Telemetry Channels',
      icon: CheckCircle2,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badge: 'Baseline Nominal',
      description:
        'Resolves and acknowledges active alarms, restoring vitals to nominal ranges across all 5 ICU beds.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Simulate ICU Clinical Scenarios</h3>
              <p className="text-xs text-slate-500">Inject realistic physiological cascades into Ward 4B</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Scenarios */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  onLoadScenario(sc.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-xs group ${sc.color}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <h4 className="text-xs font-bold">{sc.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 font-bold">
                    {sc.badge}
                  </span>
                </div>

                <div className="text-[11px] font-mono opacity-80 mb-2">
                  Target: {sc.patient} · Devices: {sc.devices}
                </div>

                <p className="text-xs opacity-90 leading-relaxed">
                  {sc.description}
                </p>

                <div className="mt-3 flex justify-end">
                  <span className="text-xs font-semibold inline-flex items-center gap-1 group-hover:underline">
                    <span>Activate Scenario</span>
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
