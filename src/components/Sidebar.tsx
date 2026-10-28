import React from 'react';
import {
  LayoutDashboard,
  BellRing,
  GitMerge,
  Syringe,
  History,
  BedDouble,
  Settings as SettingsIcon,
  ShieldAlert,
  Radio,
  Clock,
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'live-alarms'
  | 'correlation'
  | 'pump-troubleshooting'
  | 'timeline'
  | 'event-history'
  | 'ward-overview'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlarmCount: number;
  correlationGroupCount: number;
  criticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlarmCount,
  correlationGroupCount,
  criticalCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: criticalCount > 0 ? `${criticalCount} Crit` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'live-alarms' as NavTab,
      label: 'Live Alarms',
      icon: BellRing,
      badge: activeAlarmCount > 0 ? String(activeAlarmCount) : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'correlation' as NavTab,
      label: 'Correlation Analysis',
      icon: GitMerge,
      badge: correlationGroupCount > 0 ? String(correlationGroupCount) : null,
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      id: 'pump-troubleshooting' as NavTab,
      label: 'Pump Troubleshooting',
      icon: Syringe,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'timeline' as NavTab,
      label: 'Alarm Timeline',
      icon: Clock,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'ward-overview' as NavTab,
      label: 'ICU Ward Overview',
      icon: BedDouble,
      badge: '5 Beds',
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      id: 'event-history' as NavTab,
      label: 'Event History',
      icon: History,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <aside className="w-64 bg-[#081325] border-r border-[#1a2942] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none">
      {/* Navigation list */}
      <div className="p-4 space-y-1.5 flex-1">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40 font-semibold'
                  : 'text-slate-300 hover:bg-[#11223b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Clinical Advisory Notice */}
      <div className="p-4 m-3 rounded-lg bg-[#0e1c33] border border-[#1d3152] text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Clinical Safety Protocol</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Correlation groupings do not replace bedside clinical evaluation. Never delay response to critical physiological alarms.
        </p>
      </div>
    </aside>
  );
};
