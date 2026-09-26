import React from 'react';
import {
  Server,
  Users,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { ActiveTab } from './TopNavbar';
import { SystemHealthWidget } from './SystemHealthWidget';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenStkPushModal: () => void;
  onOpenVoucherModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenStkPushModal,
  onOpenVoucherModal
}) => {
  const {
    routers,
    activeSessions,
    transactions,
    vouchers,
    alerts,
    liveBandwidth,
    disconnectSession
  } = useXCloud();

  const totalSessions = activeSessions.length;
  const completedTx = transactions.filter(t => t.status === 'completed');
  const totalRevenueTzs = completedTx.reduce((sum, t) => sum + t.amountTzs, 0);
  const totalRevenueUsd = (totalRevenueTzs / 2500).toFixed(2);
  const availableVouchers = vouchers.filter(v => v.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Alert banner if any unresolved critical alerts */}
      {alerts.some(a => !a.resolved && a.severity === 'warning') && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {alerts.find(a => !a.resolved && a.severity === 'warning')?.message}
            </span>
          </div>
          <button
            onClick={() => onNavigate('routers')}
            className="text-amber-400 hover:text-amber-300 underline font-medium ml-4 shrink-0"
          >
            Inspect Fleet
          </button>
        </div>
      )}

      {/* System Infrastructure Health (Backend API Poller with Color-Coded Indicators) */}
      <SystemHealthWidget
        onInspectRouters={() => onNavigate('routers')}
        onInspectArchitecture={() => onNavigate('architecture')}
      />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fleets */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>RouterOS Fleet</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {routers.filter(r => r.status === 'online').length}
              <span className="text-sm font-normal text-slate-500"> / {routers.length}</span>
            </span>
            <span className="text-xs text-emerald-400 font-mono">100% WG VPN</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
            <span>Avg CPU: 34%</span>
            <span aria-hidden="true">·</span>
            <span>CCR2004 & RB4011</span>
          </div>
        </div>

        {/* Metric 2: Active Clients */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active Hotspot Clients</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {totalSessions}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center">
              <Activity className="w-3 h-3 mr-0.5" /> RADIUS Active
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
            <span>{availableVouchers} Vouchers in stock</span>
            <span aria-hidden="true">·</span>
            <span>5 Active Profiles</span>
          </div>
        </div>

        {/* Metric 3: Today Revenue */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Today's Mobile Revenue</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {totalRevenueTzs.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1">TZS</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">~${totalRevenueUsd}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
            <span>M-Pesa · Airtel · Tigo · Selcom</span>
          </div>
        </div>

        {/* Metric 4: Live Bandwidth */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Live Core Throughput</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <div className="flex items-center gap-1 font-mono">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xl font-bold text-white tabular-nums">
                {liveBandwidth.totalRxMbps}
              </span>
              <span className="text-xs text-slate-400">Mbps</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xl font-bold text-white tabular-nums">
                {liveBandwidth.totalTxMbps}
              </span>
              <span className="text-xs text-slate-400">Mbps</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
            <span>Peak: 120 Mbps</span>
            <span aria-hidden="true">·</span>
            <span>Real-time FreeRADIUS Acct</span>
          </div>
        </div>
      </div>

      {/* Center Grid: Live Bandwidth Realtime Graph + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Throughput Graph */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Live Aggregated Bandwidth</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>FreeRADIUS Interim Updates</span>
                <span aria-hidden="true">·</span>
                <span>WireGuard Core Gateway 10.99.0.1</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">Download (RX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Upload (TX)</span>
              </div>
            </div>
          </div>

          {/* SVG Realtime Graph */}
          <div className="h-44 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
              <defs>
                <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Polylines generated from history */}
              {(() => {
                const pts = liveBandwidth.history;
                if (pts.length < 2) return null;
                const maxVal = 80;
                const rxPoints = pts
                  .map((p, i) => {
                    const x = (i / (pts.length - 1)) * 500;
                    const y = 150 - (p.rx / maxVal) * 130;
                    return `${x},${y}`;
                  })
                  .join(' ');

                const txPoints = pts
                  .map((p, i) => {
                    const x = (i / (pts.length - 1)) * 500;
                    const y = 150 - (p.tx / maxVal) * 130;
                    return `${x},${y}`;
                  })
                  .join(' ');

                const rxArea = `${rxPoints} 500,160 0,160`;

                return (
                  <>
                    <polygon points={rxArea} fill="url(#rxGrad)" />
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      points={rxPoints}
                    />
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 2"
                      points={txPoints}
                    />
                  </>
                );
              })()}
            </svg>

            {/* Bottom time indicators */}
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
              <span>{liveBandwidth.history[0]?.time || '11:28'}</span>
              <span>Live Updates (every 4s)</span>
              <span>{liveBandwidth.history[liveBandwidth.history.length - 1]?.time || 'Now'}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Control Dock */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">NOC Quick Actions</h2>
            <p className="text-xs text-slate-400 mb-4">
              Instant triggers for RouterOS provisioning, voucher batches and payment webhooks.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenVoucherModal}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Generate Vouchers</div>
                    <div className="text-[11px] text-slate-400">Bulk batch creation & POS print</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={onOpenStkPushModal}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Simulate STK Push</div>
                    <div className="text-[11px] text-slate-400">M-Pesa / Airtel USSD trigger</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              <button
                onClick={() => onNavigate('routers')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Generate .rsc Script</div>
                    <div className="text-[11px] text-slate-400">RouterOS v7 auto-provisioning</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono text-[11px]">FreeRADIUS 3.2.3 · Postgres 16</span>
            <button
              onClick={() => onNavigate('architecture')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center gap-1"
            >
              <span>View Code</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Split Section: Router Fleet Overview & Active Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Router Fleet Status */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Connected MikroTik Fleet</h2>
              <p className="text-xs text-slate-400">WireGuard tunnel status and real-time CPU telemetry</p>
            </div>
            <button
              onClick={() => onNavigate('routers')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View All ({routers.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2.5">Identity / Model</th>
                  <th className="pb-2.5">WG IP</th>
                  <th className="pb-2.5">CPU Load</th>
                  <th className="pb-2.5">Users</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {routers.slice(0, 4).map((router) => (
                  <tr key={router.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold font-sans text-slate-200">{router.name}</div>
                      <div className="text-[11px] text-slate-400">{router.model}</div>
                    </td>
                    <td className="py-2.5 text-slate-300">{router.wireguardIp}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-slate-200">{router.cpuLoad}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              router.cpuLoad > 80 ? 'bg-rose-500' : router.cpuLoad > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${router.cpuLoad}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-200 tabular-nums">{router.activeSessions}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-sans text-[11px] font-medium ${
                          router.status === 'online'
                            ? 'text-emerald-400'
                            : router.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            router.status === 'online'
                              ? 'bg-emerald-400'
                              : router.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                        {router.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live RADIUS Hotspot Sessions */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Live RADIUS Sessions</h2>
              <p className="text-xs text-slate-400">Authenticated clients transmitting via Hotspot AAA</p>
            </div>
            <button
              onClick={() => onNavigate('sessions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Manage ({activeSessions.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2.5">Voucher / Phone</th>
                  <th className="pb-2.5">Package</th>
                  <th className="pb-2.5">Traffic</th>
                  <th className="pb-2.5">Time Left</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeSessions.slice(0, 4).map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-cyan-300">{session.username}</div>
                      <div className="text-[11px] text-slate-500">{session.macAddress}</div>
                    </td>
                    <td className="py-2.5 font-sans text-slate-300 truncate max-w-[120px]">
                      {session.packageName}
                    </td>
                    <td className="py-2.5 text-slate-300 tabular-nums">
                      {session.bytesInMb.toFixed(0)} MB
                    </td>
                    <td className="py-2.5 text-slate-300 tabular-nums">
                      {Math.floor(session.timeLeftMinutes / 60)}h {session.timeLeftMinutes % 60}m
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => disconnectSession(session.id)}
                        title="Send RFC 3576 Disconnect-Request (PoD) to router"
                        className="px-2 py-1 text-[11px] font-sans font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors"
                      >
                        PoD Kick
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Mobile Money Payments Feed */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Mobile Money Transactions</h2>
            <p className="text-xs text-slate-400">Real-time C2B & STK Push webhook notifications</p>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            All Transactions ({transactions.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5">Reference ID</th>
                <th className="pb-2.5">Customer MSISDN</th>
                <th className="pb-2.5">Gateway</th>
                <th className="pb-2.5">Plan / Package</th>
                <th className="pb-2.5">Amount</th>
                <th className="pb-2.5">Voucher Issued</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-slate-200 font-semibold">{tx.reference}</td>
                  <td className="py-2.5 text-slate-300">{tx.msisdn}</td>
                  <td className="py-2.5 font-sans">
                    <span className="uppercase text-[11px] font-semibold text-slate-300">
                      {tx.gateway}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans text-slate-300">{tx.packageName}</td>
                  <td className="py-2.5 text-slate-100 font-semibold tabular-nums">
                    {tx.amountTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-2.5">
                    {tx.voucherCode ? (
                      <span className="text-cyan-400 font-semibold">{tx.voucherCode}</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-block font-sans text-[11px] font-medium ${
                        tx.status === 'completed'
                          ? 'text-emerald-400'
                          : tx.status === 'pending'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
