import React, { useState } from 'react';
import {
  Users,
  Search,
  Radio,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';

export const ActiveSessionsView: React.FC = () => {
  const { activeSessions, disconnectSession, routers } = useXCloud();
  const [search, setSearch] = useState('');
  const [selectedRouterFilter, setSelectedRouterFilter] = useState('all');
  const [disconnectToast, setDisconnectToast] = useState<string | null>(null);

  const filteredSessions = activeSessions.filter((s) => {
    if (selectedRouterFilter !== 'all' && s.routerId !== selectedRouterFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.username.toLowerCase().includes(q) ||
        s.macAddress.toLowerCase().includes(q) ||
        s.ipAddress.toLowerCase().includes(q) ||
        s.packageName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDisconnect = (sessionId: string, username: string, ip: string) => {
    const success = disconnectSession(sessionId);
    if (success) {
      setDisconnectToast(`RFC 3576 Disconnect-ACK received. Session ${username} (${ip}) terminated on MikroTik Hotspot.`);
      setTimeout(() => setDisconnectToast(null), 4000);
    }
  };

  const totalRx = activeSessions.reduce((acc, s) => acc + s.currentRxMbps, 0);
  const totalTx = activeSessions.reduce((acc, s) => acc + s.currentTxMbps, 0);
  const totalDownloadedGb = (
    activeSessions.reduce((acc, s) => acc + s.bytesInMb, 0) / 1024
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {disconnectToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{disconnectToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Active Hotspot RADIUS Sessions</h1>
          <p className="text-xs text-slate-400">
            Real-time FreeRADIUS accounting stream with RFC 3576 Packet-of-Disconnect (PoD) control
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Live Traffic:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{totalRx.toFixed(1)}M Rx</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold tabular-nums">{totalTx.toFixed(1)}M Tx</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Volume:</span>
            <span className="text-white font-bold tabular-nums">{totalDownloadedGb} GB</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedRouterFilter}
            onChange={(e) => setSelectedRouterFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300 font-sans focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Routers ({activeSessions.length} total sessions)</option>
            {routers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.identity})
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search username, MAC, IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-400 font-mono w-full sm:w-64"
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Client Username / Voucher</th>
                <th className="pb-3">Device MAC & IP</th>
                <th className="pb-3">Assigned Router</th>
                <th className="pb-3">Package / Plan</th>
                <th className="pb-3">Connected Since</th>
                <th className="pb-3">Time Remaining</th>
                <th className="pb-3">Data Consumed</th>
                <th className="pb-3">Current Speed</th>
                <th className="pb-3 text-right">RADIUS Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-cyan-300 text-sm">{session.username}</div>
                    <div className="text-[11px] text-slate-500 font-sans">Voucher Authentication</div>
                  </td>
                  <td className="py-3">
                    <div className="text-slate-200 font-medium">{session.macAddress}</div>
                    <div className="text-[11px] text-slate-400">{session.ipAddress}</div>
                  </td>
                  <td className="py-3 font-sans">
                    <div className="text-slate-200 font-medium">{session.routerName}</div>
                  </td>
                  <td className="py-3 font-sans text-slate-300">{session.packageName}</td>
                  <td className="py-3 text-slate-400 font-sans">{session.startedAt}</td>
                  <td className="py-3">
                    <div className="text-slate-200 tabular-nums">
                      {Math.floor(session.timeLeftMinutes / 60)}h {session.timeLeftMinutes % 60}m
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-slate-200 tabular-nums font-semibold">
                      {session.bytesInMb.toFixed(1)} MB
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      ↑ {session.bytesOutMb.toFixed(1)} MB
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-emerald-400 tabular-nums">
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>{session.currentRxMbps} Mbps</span>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400 tabular-nums text-[11px]">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{session.currentTxMbps} Mbps</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={() => handleDisconnect(session.id, session.username, session.ipAddress)}
                      title="Send RFC 3576 Disconnect-Request to NAS"
                      className="px-2.5 py-1 text-[11px] font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Disconnect (CoA)</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                    No active sessions found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
