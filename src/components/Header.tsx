import React from 'react';
import { Activity, Bell, Volume2, VolumeX, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { Severity } from '../types/icu';

interface HeaderProps {
  simulatedTime: string;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  criticalAlarmCount: number;
  onOpenScenarioModal: () => void;
  onResetSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulatedTime,
  isSimulating,
  onToggleSimulation,
  audioMuted,
  onToggleAudio,
  criticalAlarmCount,
  onOpenScenarioModal,
  onResetSimulation,
}) => {
  return (
    <header className="bg-[#0b172a] border-b border-[#1e293b] text-slate-100 sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Ward Label */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">ICU SENSE</span>
                <span className="text-[11px] text-teal-300 font-medium tracking-wide">Smart Alarm Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Ward 4B — Cardiovascular & Surgical ICU</p>
            </div>
          </div>
        </div>

        {/* Center: Ward Status & Critical alert warning if active */}
        <div className="hidden lg:flex items-center gap-3">
          {criticalAlarmCount > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{criticalAlarmCount} Critical Alarm{criticalAlarmCount > 1 ? 's' : ''} Require Immediate Attention</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Telemetry Signals Stable · Ward Monitoring Active</span>
            </div>
          )}
        </div>

        {/* Right: Simulation Clock, Simulation Mode Badge, Audio & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Simulated Time */}
          <div className="flex items-center gap-2 bg-[#132238] border border-[#23354e] px-2.5 py-1 rounded text-xs">
            <span className="text-slate-400 font-medium">Sim Time:</span>
            <span className="font-mono font-semibold text-teal-300 tabular-nums text-xs">{simulatedTime}</span>
          </div>

          {/* Green Simulation Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Simulation Mode</span>
          </div>

          {/* Audio Alert Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioMuted ? "Unmute alarm sounds" : "Mute alarm sounds"}
            className={`p-2 rounded border text-xs flex items-center gap-1 transition-colors ${
              audioMuted 
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200' 
                : 'bg-teal-500/10 border-teal-500/40 text-teal-300 hover:bg-teal-500/20'
            }`}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Test Scenario Launcher */}
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Scenario</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetSimulation}
            title="Reset telemetry & alarms to baseline"
            className="p-1.5 rounded bg-[#132238] border border-[#23354e] text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
