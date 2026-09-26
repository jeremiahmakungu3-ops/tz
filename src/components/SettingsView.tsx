import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Server,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Radio,
  FileCheck
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useXCloud();
  const [formData, setFormData] = useState(settings);
  const [saveToast, setSaveToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">System & Provisioning Configuration</h1>
          <p className="text-xs text-slate-400">
            Define WireGuard VPN gateways, FreeRADIUS authentication parameters, and default captive portal profiles
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration saved successfully. All newly generated .rsc provisioning scripts will use these parameters.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WireGuard VPN Configuration */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Central WireGuard VPN Tunnel Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">WireGuard Server Host/FQDN</label>
              <input
                type="text"
                required
                value={formData.wireguardEndpoint}
                onChange={(e) => setFormData({ ...formData, wireguardEndpoint: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">WireGuard UDP Port</label>
              <input
                type="number"
                required
                value={formData.wireguardPort}
                onChange={(e) => setFormData({ ...formData, wireguardPort: parseInt(e.target.value) || 51820 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Server Public Key</label>
              <input
                type="text"
                required
                value={formData.wireguardServerPublicKey}
                onChange={(e) => setFormData({ ...formData, wireguardServerPublicKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* FreeRADIUS AAA Configuration */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">FreeRADIUS 3.x AAA Accounting & CoA</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">RADIUS Server IP (Inside Tunnel)</label>
              <input
                type="text"
                required
                value={formData.radiusServerIp}
                onChange={(e) => setFormData({ ...formData, radiusServerIp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">RADIUS Shared Secret</label>
              <input
                type="text"
                required
                value={formData.radiusSecret}
                onChange={(e) => setFormData({ ...formData, radiusSecret: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Auth Port (UDP)</label>
              <input
                type="number"
                required
                value={formData.radiusAuthPort}
                onChange={(e) => setFormData({ ...formData, radiusAuthPort: parseInt(e.target.value) || 1812 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Accounting Port (UDP)</label>
              <input
                type="number"
                required
                value={formData.radiusAcctPort}
                onChange={(e) => setFormData({ ...formData, radiusAcctPort: parseInt(e.target.value) || 1813 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">CoA / PoD Port (RFC 3576)</label>
              <input
                type="number"
                required
                value={formData.radiusCoaPort}
                onChange={(e) => setFormData({ ...formData, radiusCoaPort: parseInt(e.target.value) || 3799 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Captive Portal DNS Name</label>
              <input
                type="text"
                required
                value={formData.hotspotDnsName}
                onChange={(e) => setFormData({ ...formData, hotspotDnsName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
