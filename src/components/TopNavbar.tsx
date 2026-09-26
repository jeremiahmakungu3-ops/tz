import React from 'react';
import {
  Server,
  Radio,
  Ticket,
  Users,
  CreditCard,
  Briefcase,
  Code2,
  Settings,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Zap,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';

export type ActiveTab =
  | 'dashboard'
  | 'routers'
  | 'portal'
  | 'pipeline'
  | 'vouchers'
  | 'sessions'
  | 'payments'
  | 'customers'
  | 'agents'
  | 'reports'
  | 'architecture'
  | 'settings';

interface TopNavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenStkPushModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenStkPushModal
}) => {
  const { routers, alerts } = useXCloud();
  const onlineCount = routers.filter(r => r.status === 'online').length;
  const warningCount = routers.filter(r => r.status === 'warning').length;

  const navLinks: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'routers', label: 'Routers', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'portal', label: 'Captive Portal', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'pipeline', label: 'Auto Activation', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'vouchers', label: 'Vouchers', icon: <Ticket className="w-3.5 h-3.5" /> },
    { id: 'sessions', label: 'Active Sessions', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Mobile Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'customers', label: 'Customers', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'agents', label: 'Resellers', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'architecture', label: 'System Codebase', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/60 transition-colors">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              XCLOUD<span className="text-cyan-400 font-mono text-xs ml-1 font-semibold">NOC</span>
            </span>
          </a>
        </div>

        {/* Zone 2: Clean 1-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action + Telemetry status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800">
            {warningCount > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="tabular-nums text-slate-300 font-medium">
              {onlineCount}/{routers.length}
            </span>
            <span className="text-slate-500 text-[11px]">Routers Online</span>
          </div>

          <button
            onClick={onOpenStkPushModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-md hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-sm shadow-cyan-950 whitespace-nowrap active:scale-[0.98]"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Test STK Push</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab scrollbar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/50 bg-slate-900/40">
        {navLinks.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
