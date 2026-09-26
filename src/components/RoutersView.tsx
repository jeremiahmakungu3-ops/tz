import React, { useState } from 'react';
import {
  Server,
  Plus,
  Terminal,
  RefreshCw,
  Power,
  Trash2,
  Copy,
  Check,
  Download,
  Activity,
  Cpu,
  Thermometer,
  ShieldCheck,
  FileCode,
  X,
  ExternalLink
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { RouterDevice } from '../types';
import {
  generateFullBootstrapRsc,
  generateWireguardRsc,
  generateRadiusRsc,
  generateHotspotRsc,
  generateHeartbeatRsc
} from '../services/provisioningGenerator';

export const RoutersView: React.FC = () => {
  const { routers, addRouter, rebootRouter, syncRouter, deleteRouter, settings } = useXCloud();
  
  const [selectedRouter, setSelectedRouter] = useState<RouterDevice | null>(null);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [activeRscTab, setActiveRscTab] = useState<'master' | 'wireguard' | 'radius' | 'hotspot' | 'heartbeat'>('master');
  
  const [diagnosticsRouter, setDiagnosticsRouter] = useState<RouterDevice | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResults, setPingResults] = useState<string[]>([]);

  // Remote Terminal State
  const [terminalRouter, setTerminalRouter] = useState<RouterDevice | null>(null);
  const [termCmd, setTermCmd] = useState('');
  const [termHistory, setTermHistory] = useState<{ cmd: string; output: string[] }[]>([
    {
      cmd: '/system resource print',
      output: [
        '                   uptime: 42d18h33m12s',
        '                  version: 7.14.3 (stable)',
        '               build-time: 2026-03-12 09:22:15',
        '              free-memory: 2450.8MiB',
        '             total-memory: 4096.0MiB',
        '                      cpu: ARM64 AL32400',
        '                cpu-count: 4',
        '            cpu-frequency: 1400MHz',
        '                 cpu-load: 24%',
        '           free-hdd-space: 89.2MiB',
        '          total-hdd-space: 128.0MiB',
        '  architecture-name: arm64',
        '               board-name: CCR2004-16G-2S+',
        '                 platform: MikroTik'
      ]
    }
  ]);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // Add Router Form State
  const [newRouterData, setNewRouterData] = useState({
    name: '',
    identity: '',
    model: 'MikroTik RB4011iGS+5HacQ2HnD-IN',
    serialNumber: '',
    routerOsVersion: 'RouterOS v7.14.3',
    ipAddress: '',
    wireguardIp: `10.99.0.${routers.length + 2}`,
    macAddress: '',
    location: '',
    status: 'online' as const,
  });

  const handleOpenProvision = (router: RouterDevice) => {
    setSelectedRouter(router);
    setActiveRscTab('master');
    setProvisionModalOpen(true);
  };

  const getRscContent = () => {
    if (!selectedRouter) return '';
    switch (activeRscTab) {
      case 'master':
        return generateFullBootstrapRsc(selectedRouter, settings);
      case 'wireguard':
        return generateWireguardRsc(selectedRouter, settings);
      case 'radius':
        return generateRadiusRsc(selectedRouter, settings);
      case 'hotspot':
        return generateHotspotRsc(selectedRouter, settings);
      case 'heartbeat':
        return generateHeartbeatRsc(selectedRouter, settings);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(getRscContent());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadRsc = () => {
    if (!selectedRouter) return;
    const content = getRscContent();
    const filename = `${selectedRouter.identity.toLowerCase()}-${activeRscTab}.rsc`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunPing = (router: RouterDevice) => {
    setDiagnosticsRouter(router);
    setIsPinging(true);
    setPingResults([]);

    const msgs = [
      `Sending 4 ICMP pings to ${router.wireguardIp} via wg-xcloud interface...`,
      `PING ${router.wireguardIp} 56(84) bytes of data.`,
      `64 bytes from ${router.wireguardIp}: icmp_seq=1 ttl=64 time=18.4 ms`,
      `64 bytes from ${router.wireguardIp}: icmp_seq=2 ttl=64 time=16.8 ms`,
      `64 bytes from ${router.wireguardIp}: icmp_seq=3 ttl=64 time=19.1 ms`,
      `64 bytes from ${router.wireguardIp}: icmp_seq=4 ttl=64 time=17.2 ms`,
      `--- ${router.wireguardIp} ping statistics ---`,
      `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
      `rtt min/avg/max/mdev = 16.8/17.8/19.1/0.9 ms [RADIUS AAA latency: 4ms]`
    ];

    msgs.forEach((msg, idx) => {
      setTimeout(() => {
        setPingResults(prev => [...prev, msg]);
        if (idx === msgs.length - 1) {
          setIsPinging(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const handleAddRouterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouterData.name || !newRouterData.identity) {
      alert('Please provide a router name and identity.');
      return;
    }

    addRouter({
      ...newRouterData,
      serialNumber: newRouterData.serialNumber || `SN${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      ipAddress: newRouterData.ipAddress || `197.250.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
      macAddress: newRouterData.macAddress || `48:8F:5A:${Math.floor(Math.random() * 90 + 10)}:${Math.floor(Math.random() * 90 + 10)}:${Math.floor(Math.random() * 90 + 10)}`,
      location: newRouterData.location || 'Central Location',
    });

    setAddModalOpen(false);
    setNewRouterData({
      name: '',
      identity: '',
      model: 'MikroTik RB4011iGS+5HacQ2HnD-IN',
      serialNumber: '',
      routerOsVersion: 'RouterOS v7.14.3',
      ipAddress: '',
      wireguardIp: `10.99.0.${routers.length + 3}`,
      macAddress: '',
      location: '',
      status: 'online',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">MikroTik RouterOS Fleet</h1>
          <p className="text-xs text-slate-400">
            Automated provisioning via WireGuard VPN & FreeRADIUS AAA accounting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add MikroTik Router</span>
          </button>
        </div>
      </div>

      {/* Routers Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Router Name & Identity</th>
                <th className="pb-3">Model / OS</th>
                <th className="pb-3">WG VPN IP</th>
                <th className="pb-3">WAN IP</th>
                <th className="pb-3">CPU / Temp</th>
                <th className="pb-3">Active Users</th>
                <th className="pb-3">Uptime</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {routers.map((router) => (
                <tr key={router.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-200">{router.name}</div>
                    <div className="text-[11px] text-cyan-400 font-mono">{router.identity}</div>
                    <div className="text-[11px] text-slate-500">{router.location}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-sans text-slate-200 font-medium">{router.model}</div>
                    <div className="text-[11px] text-slate-400">{router.routerOsVersion}</div>
                  </td>
                  <td className="py-3 text-slate-200 font-semibold">{router.wireguardIp}</td>
                  <td className="py-3 text-slate-400">{router.ipAddress}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 tabular-nums">{router.cpuLoad}%</span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full ${
                            router.cpuLoad > 80 ? 'bg-rose-500' : router.cpuLoad > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${router.cpuLoad}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Thermometer className="w-3 h-3 text-slate-500" />
                      <span>{router.temp}°C</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-200 tabular-nums font-semibold">
                    {router.activeSessions}
                  </td>
                  <td className="py-3 text-slate-300 font-sans text-[11px]">{router.uptime}</td>
                  <td className="py-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
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
                  <td className="py-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenProvision(router)}
                        title="Generate RouterOS v7 .rsc configuration"
                        className="px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded flex items-center gap-1 transition-colors"
                      >
                        <FileCode className="w-3 h-3" />
                        <span>.rsc Script</span>
                      </button>

                      <button
                        onClick={() => handleRunPing(router)}
                        title="Test ping & diagnose connection"
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setTerminalRouter(router)}
                        title="Open Remote WinBox / RouterOS Console"
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => rebootRouter(router.id)}
                        title="Simulate RouterOS Reboot"
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteRouter(router.id)}
                        title="Remove router from NOC"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Script Generator Modal */}
      {provisionModalOpen && selectedRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    RouterOS Provisioning Script Generator
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Target: {selectedRouter.identity} · WireGuard: {selectedRouter.wireguardIp}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setProvisionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Command Paste Box */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Terminal Command (Run in MikroTik WinBox or SSH):</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-black/60 border border-slate-800 font-mono text-xs text-cyan-300">
                <span className="text-slate-500">$</span>
                <span className="truncate flex-1 select-all">
                  /tool fetch url="https://cloud.xcloud-isp.net/api/provision/{selectedRouter.provisionToken}/" mode=https dst-path=xcloud.rsc; /import xcloud.rsc
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `/tool fetch url="https://cloud.xcloud-isp.net/api/provision/${selectedRouter.provisionToken}/" mode=https dst-path=xcloud.rsc; /import xcloud.rsc`
                    );
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-sans flex items-center gap-1 transition-colors shrink-0"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Script Selector Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
              {[
                { id: 'master', label: 'Master Bootstrap.rsc' },
                { id: 'wireguard', label: 'WireGuard VPN.rsc' },
                { id: 'radius', label: 'FreeRADIUS AAA.rsc' },
                { id: 'hotspot', label: 'Hotspot & Walled Garden.rsc' },
                { id: 'heartbeat', label: 'Heartbeat Scheduler.rsc' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRscTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeRscTab === tab.id
                      ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Script Code Viewer */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{getRscContent()}</pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/70">
              <div className="text-[11px] text-slate-500 font-mono">
                RouterOS v7.x Syntactically Validated · UTF-8
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied to Clipboard' : 'Copy Full Script'}</span>
                </button>
                <button
                  onClick={handleDownloadRsc}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .rsc File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics / Ping Modal */}
      {diagnosticsRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Live Diagnostics: {diagnosticsRouter.identity}
                </h3>
              </div>
              <button
                onClick={() => setDiagnosticsRouter(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-slate-500">WG Endpoint:</span>
                  <div className="text-slate-200 font-semibold">{diagnosticsRouter.wireguardIp}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-slate-500">RADIUS AAA Port:</span>
                  <div className="text-slate-200 font-semibold">{settings.radiusAuthPort} (1812 UDP)</div>
                </div>
              </div>

              {/* Terminal Log */}
              <div className="p-3 rounded-lg bg-black font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1">
                {pingResults.map((line, i) => (
                  <div key={i} className="text-emerald-400/90 leading-tight">
                    {line}
                  </div>
                ))}
                {isPinging && (
                  <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Executing ping probe...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/70">
              <span className="text-xs text-slate-400">Tunnel Status: WireGuard Handshake Active</span>
              <button
                onClick={() => setDiagnosticsRouter(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Router Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-semibold text-white">Add MikroTik Router</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRouterSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Friendly Location / Site Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mwenge Bus Terminal Hotspot"
                  value={newRouterData.name}
                  onChange={(e) => setNewRouterData({ ...newRouterData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">System Identity (RouterOS Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., MK-DAR-MWENGE-06"
                  value={newRouterData.identity}
                  onChange={(e) => setNewRouterData({ ...newRouterData, identity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Hardware Model</label>
                <select
                  value={newRouterData.model}
                  onChange={(e) => setNewRouterData({ ...newRouterData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="MikroTik CCR2004-16G-2S+">MikroTik CCR2004-16G-2S+ (Core)</option>
                  <option value="MikroTik RB4011iGS+5HacQ2HnD-IN">MikroTik RB4011 (High Density)</option>
                  <option value="MikroTik hEX S (RB760iGS)">MikroTik hEX S (Compact/SMB)</option>
                  <option value="MikroTik RB3011UiAS-RM">MikroTik RB3011 Rackmount</option>
                  <option value="MikroTik Groove 52 ac">MikroTik Groove Outdoor AP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">WireGuard IP</label>
                  <input
                    type="text"
                    required
                    value={newRouterData.wireguardIp}
                    onChange={(e) => setNewRouterData({ ...newRouterData, wireguardIp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Public WAN IP</label>
                  <input
                    type="text"
                    placeholder="e.g. 197.250.88.10"
                    value={newRouterData.ipAddress}
                    onChange={(e) => setNewRouterData({ ...newRouterData, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Deployment Location</label>
                <input
                  type="text"
                  placeholder="e.g. Dar es Salaam, Mwenge"
                  value={newRouterData.location}
                  onChange={(e) => setNewRouterData({ ...newRouterData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                >
                  Save & Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Remote WinBox / RouterOS Terminal Console Modal */}
      {terminalRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white font-mono">
                    RouterOS Terminal: admin@{terminalRouter.identity}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    WireGuard Tunnel IP: {terminalRouter.wireguardIp} · v7.14.3
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTerminalRouter(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-[11px] font-mono">
              <span className="text-slate-500 font-sans text-xs shrink-0">Presets:</span>
              {[
                '/system resource print',
                '/ip hotspot active print',
                '/interface print',
                '/radius print',
                '/ip dns cache flush',
                '/log print where topics~"hotspot"',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    let out: string[] = [];
                    if (cmd === '/system resource print') {
                      out = [
                        `uptime: ${terminalRouter.uptime}`,
                        `version: ${terminalRouter.routerOsVersion}`,
                        `cpu-load: ${terminalRouter.cpuLoad}%`,
                        `free-memory: 2410MiB`,
                        `total-memory: 4096MiB`,
                        `board-name: ${terminalRouter.model}`,
                      ];
                    } else if (cmd === '/ip hotspot active print') {
                      out = [
                        'Flags: R - RADIUS, D - dynamic',
                        ' #   SERVER  USER    ADDRESS         MAC-ADDRESS       UPTIME   BYTES-IN  BYTES-OUT',
                        ' 0 R hs-srv  829104  192.168.88.241  9C:20:7B:44:19:EA 3h18m    1.42GB    184MB',
                        ' 1 R hs-srv  517390  192.168.88.112  A4:C3:F0:88:21:77 23m      420MB     35MB',
                        ' 2 R hs-srv  338192  192.168.88.189  FE:12:44:BB:78:09 1d19h    8.94GB    1.12GB',
                      ];
                    } else if (cmd === '/interface print') {
                      out = [
                        'Flags: D - dynamic, X - disabled, R - running, S - slave',
                        ' #     NAME            TYPE      ACTUAL-MTU  MAC-ADDRESS',
                        ' 0  R  ether1-WAN      ether           1500  DC:2C:6E:44:81:20',
                        ' 1  RS ether2-LAN      ether           1500  DC:2C:6E:44:81:21',
                        ' 2  R  wg-xcloud       wireguard       1420  00:00:00:00:00:00',
                        ' 3  R  bridge-hotspot  bridge          1500  DC:2C:6E:44:81:22',
                      ];
                    } else if (cmd === '/radius print') {
                      out = [
                        'Flags: X - disabled, D - dynamic',
                        ' #   SERVICE           CALLED-ID  DOMAIN  ADDRESS    SECRET',
                        ' 0   hotspot,wireless                     10.99.0.1  xCloud_R4dius_S3cr3t_2026',
                        'Incoming CoA: accept=yes port=3799',
                      ];
                    } else if (cmd === '/ip dns cache flush') {
                      out = ['DNS cache flushed successfully.'];
                    } else {
                      out = [
                        '12:34:10 hotspot,info,debug 829104 (192.168.88.241): logged in via HTTP PAP',
                        '12:35:22 hotspot,info,debug 517390 (192.168.88.112): RADIUS accounting interim update sent',
                        '12:36:01 hotspot,info,debug 338192 (192.168.88.189): queue limit updated to 12M/6M',
                      ];
                    }
                    setTermHistory((prev) => [...prev, { cmd, output: out }]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 p-4 bg-black font-mono text-xs text-slate-300 min-h-[300px] max-h-[420px] overflow-y-auto space-y-3">
              <div className="text-cyan-400">
                MikroTik RouterOS 7.14.3 (c) 1999-2026 Routerboard.com
                <br />
                Connected securely via XCLOUD WireGuard Tunnel (10.99.0.1 → {terminalRouter.wireguardIp})
              </div>

              {termHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="text-slate-500">[admin@{terminalRouter.identity}] &gt;</span>
                    <span className="font-bold text-white">{item.cmd}</span>
                  </div>
                  <div className="text-slate-300 pl-4 space-y-0.5">
                    {item.output.map((line, lidx) => (
                      <div key={lidx}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!termCmd.trim()) return;
                const cmd = termCmd.trim();
                const out = [
                  `Command '${cmd}' executed remotely via RouterOS API.`,
                  'Status: 200 OK (0.012s elapsed).'
                ];
                setTermHistory((prev) => [...prev, { cmd, output: out }]);
                setTermCmd('');
              }}
              className="flex items-center gap-2 p-3 bg-slate-950 border-t border-slate-800 font-mono text-xs"
            >
              <span className="text-emerald-400 font-bold">[admin@{terminalRouter.identity}] &gt;</span>
              <input
                type="text"
                value={termCmd}
                onChange={(e) => setTermCmd(e.target.value)}
                placeholder="Type RouterOS command (e.g. /ping 8.8.8.8 count=4)..."
                className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded font-sans text-xs"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
