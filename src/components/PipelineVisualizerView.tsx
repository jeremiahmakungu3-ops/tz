import React, { useState } from 'react';
import {
  Server,
  Radio,
  ShieldCheck,
  CreditCard,
  Ticket,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
  Wifi,
  Users
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';

export const PipelineVisualizerView: React.FC = () => {
  const { routers, dynamicQueues, pipelineLogs, addPipelineLog, packages } = useXCloud();
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  const stages = [
    {
      step: 1,
      id: 'mikrotik',
      title: 'MikroTik RouterOS',
      subtitle: 'WireGuard Tunnel & Queues',
      icon: <Server className="w-5 h-5 text-blue-400" />,
      color: 'blue',
      metrics: `${routers.filter(r => r.status === 'online').length} Routers Online · 10.99.0.0/24`,
      details: 'WireGuard VPN interface, DHCP leases 192.168.88.0/24, Dynamic Simple Queues with rate limits.',
    },
    {
      step: 2,
      id: 'hotspot',
      title: 'Hotspot Walled Garden',
      subtitle: 'Captive Portal DNS Intercept',
      icon: <Radio className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      metrics: 'http://wifi.login · 11 Walled Garden Hosts',
      details: 'Captures HTTP/HTTPS requests, allows mobile money API callbacks (Safaricom, Vodacom, Airtel, Selcom) without authentication.',
    },
    {
      step: 3,
      id: 'radius',
      title: 'FreeRADIUS 3.x AAA',
      subtitle: 'Authentication & Accounting',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      metrics: 'Ports 1812 / 1813 / 3799 UDP',
      details: 'RADIUS Access-Request authorization, interim-update accounting every 60s, RFC 3576 Disconnect-Request (PoD).',
    },
    {
      step: 4,
      id: 'billing',
      title: 'XCLOUD Billing Engine',
      subtitle: 'Packages & Rate Limits',
      icon: <Layers className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      metrics: `${packages.length} Active Bandwidth Packages`,
      details: 'Enforces upload/download speed tiers (e.g. 10M/5M), session duration timers, data quotas in GB, and pricing in TZS.',
    },
    {
      step: 5,
      id: 'payment',
      title: 'Payment Gateway',
      subtitle: 'Mobile Money STK Push',
      icon: <CreditCard className="w-5 h-5 text-rose-400" />,
      color: 'rose',
      metrics: 'M-Pesa · Airtel · Tigo · Selcom',
      details: 'Direct USSD push to customer mobile handset, asynchronous IPN webhook callback with ResultCode: 0.',
    },
    {
      step: 6,
      id: 'customer',
      title: 'Customer / Voucher',
      subtitle: 'MAC Binding & Pin Gen',
      icon: <Ticket className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
      metrics: 'Device MAC address bound in CRM',
      details: 'Generates secure voucher credentials, logs customer MSISDN, and binds client hardware MAC address for roaming.',
    },
    {
      step: 7,
      id: 'activation',
      title: 'Automatic Activation',
      subtitle: 'Zero-Touch Walled Garden Unlock',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      metrics: 'Access-Accept → Walled Garden Unlocked',
      details: 'Router automatically authorizes the device MAC address. The client immediately surfs at high speed with zero manual PIN entry.',
    },
  ];

  const handleRunFullPipelineTest = () => {
    setIsSimulating(true);
    setActiveStageIndex(0);

    const stagesChain = [
      { step: 0, stage: 'MikroTik' as const, msg: 'Client device 3C:22:FB:90:1A:44 requested IP via DHCP (Assigned: 192.168.88.204)' },
      { step: 1, stage: 'Hotspot' as const, msg: 'Hotspot captured HTTP request, redirected client to captive portal http://wifi.login' },
      { step: 2, stage: 'RADIUS' as const, msg: 'FreeRADIUS confirmed client is in Walled Garden pending payment or voucher' },
      { step: 3, stage: 'Billing' as const, msg: 'Client selected package 24 Hours Unlimited (2,000 TZS, 10M/5M bandwidth limit)' },
      { step: 4, stage: 'Payment Gateway' as const, msg: 'M-Pesa STK push initiated -> Customer authorized PIN -> IPN Webhook callback: ResultCode 0' },
      { step: 5, stage: 'Customer/Voucher' as const, msg: 'XCLOUD Billing created voucher and bound device MAC 3C:22:FB:90:1A:44 to profile' },
      { step: 6, stage: 'Automatic Activation' as const, msg: 'FreeRADIUS Access-Accept pushed to MikroTik Hotspot. Dynamic queue hs-829104 created. ONLINE!' },
    ];

    stagesChain.forEach((item, idx) => {
      setTimeout(() => {
        setActiveStageIndex(item.step);
        addPipelineLog(item.stage, item.msg, idx === 6 ? 'success' : 'info');
        if (idx === stagesChain.length - 1) {
          setIsSimulating(false);
          setActiveStageIndex(null);
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            End-to-End Automatic Activation Pipeline
          </h1>
          <p className="text-xs text-slate-400">
            MikroTik → Hotspot → RADIUS → XCLOUD Billing → Payment Gateway → Customer/Voucher → Automatic Activation
          </p>
        </div>
        <button
          onClick={handleRunFullPipelineTest}
          disabled={isSimulating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-md transition-all shadow-sm disabled:opacity-50"
        >
          {isSimulating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>{isSimulating ? 'Executing Pipeline Sequence...' : 'Run Pipeline Simulation'}</span>
        </button>
      </div>

      {/* 7-Stage Flow Visualizer */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Pipeline Flow Architecture
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 relative">
          {stages.map((stage, idx) => {
            const isActive = activeStageIndex === idx;
            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950 scale-105 ring-2 ring-cyan-400/50'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      STAGE 0{stage.step}
                    </span>
                    {stage.icon}
                  </div>
                  <h3 className="text-xs font-bold text-white mb-0.5">{stage.title}</h3>
                  <p className="text-[11px] text-cyan-400 font-medium mb-2">{stage.subtitle}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{stage.details}</p>
                </div>

                <div className="pt-2.5 mt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                  {stage.metrics}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic MikroTik Simple Queues Table (Speed Limits per Package) */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">
                MikroTik Dynamic Simple Queues (/queue simple)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Active bandwidth limits enforced dynamically on each authenticated client IP address
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {dynamicQueues.length} Active Bandwidth Queues
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans text-xs font-medium">
                <th className="pb-3">Queue Name</th>
                <th className="pb-3">Target IP</th>
                <th className="pb-3">Rate Limit (Rx/Tx)</th>
                <th className="pb-3">Burst Limit</th>
                <th className="pb-3">Bytes Downloaded</th>
                <th className="pb-3">Bytes Uploaded</th>
                <th className="pb-3">Dropped</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dynamicQueues.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 text-cyan-300 font-semibold">{q.name}</td>
                  <td className="py-2.5 text-slate-300">{q.targetIp}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{q.rateLimit}</td>
                  <td className="py-2.5 text-amber-400">{q.burstLimit}</td>
                  <td className="py-2.5 text-slate-200 tabular-nums">{q.bytesInMb.toFixed(1)} MB</td>
                  <td className="py-2.5 text-slate-400 tabular-nums">{q.bytesOutMb.toFixed(1)} MB</td>
                  <td className="py-2.5 text-slate-500 tabular-nums">{q.packetsDropped} pkts</td>
                  <td className="py-2.5 text-right font-sans">
                    <span className="text-emerald-400 text-[11px] font-semibold">ENFORCING</span>
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
