import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Search,
  CheckCircle2,
  DollarSign,
  Ticket,
  Printer,
  X
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { Agent, Voucher } from '../types';

export const AgentsView: React.FC = () => {
  const { agents, topupAgentWallet, sellVoucherByAgent, packages } = useXCloud();

  const [search, setSearch] = useState('');
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [selectedAgentForTopup, setSelectedAgentForTopup] = useState<Agent | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(50000);

  // Agent POS Sale modal
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [selectedAgentForPos, setSelectedAgentForPos] = useState<Agent | null>(null);
  const [selectedPosPackageId, setSelectedPosPackageId] = useState<string>(packages[0]?.id || '');
  const [soldVoucherResult, setSoldVoucherResult] = useState<Voucher | null>(null);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  const totalFloatBalance = agents.reduce((sum, a) => sum + a.balanceTzs, 0);
  const totalCommissionsPaid = agents.reduce((sum, a) => sum + a.totalCommissionTzs, 0);
  const totalVouchersSoldByAgents = agents.reduce((sum, a) => sum + a.vouchersSold, 0);

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForTopup || topupAmount <= 0) return;
    topupAgentWallet(selectedAgentForTopup.id, topupAmount);
    setTopupModalOpen(false);
    setSelectedAgentForTopup(null);
  };

  const handlePosSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForPos || !selectedPosPackageId) return;
    const vch = sellVoucherByAgent(selectedAgentForPos.id, selectedPosPackageId);
    if (vch) {
      setSoldVoucherResult(vch);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Agent & Reseller Network</h1>
          <p className="text-xs text-slate-400">
            Kiosk float management, commission tracking, and over-the-counter POS voucher sales
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Reseller Float Balance</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalFloatBalance.toLocaleString()} <span className="text-xs text-slate-400 font-sans">TZS</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Circulating in reseller wallets</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Commissions Earned</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalCommissionsPaid.toLocaleString()} <span className="text-xs text-slate-400 font-sans">TZS</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-2">12% - 15% Average Margin</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Vouchers Sold by Agents</span>
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalVouchersSoldByAgents.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Across 4 physical retail hubs</div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-400 font-sans w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Agent / Kiosk Name</th>
                <th className="pb-3">Location & Phone</th>
                <th className="pb-3">Float Balance</th>
                <th className="pb-3">Commission Rate</th>
                <th className="pb-3">Vouchers Sold</th>
                <th className="pb-3">Total Earned</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-200">{agent.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {agent.id}</div>
                  </td>
                  <td className="py-3 font-sans">
                    <div className="text-slate-300 font-medium">{agent.location}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{agent.phone}</div>
                  </td>
                  <td className="py-3">
                    <span className="text-slate-100 font-bold tabular-nums">
                      {agent.balanceTzs.toLocaleString()} TZS
                    </span>
                  </td>
                  <td className="py-3 text-cyan-400 font-semibold">{agent.commissionRate}%</td>
                  <td className="py-3 text-slate-200 tabular-nums">{agent.vouchersSold}</td>
                  <td className="py-3 text-emerald-400 font-semibold tabular-nums">
                    {agent.totalCommissionTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedAgentForPos(agent);
                          setSelectedPosPackageId(packages[0]?.id || '');
                          setSoldVoucherResult(null);
                          setPosModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                      >
                        POS Sale
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgentForTopup(agent);
                          setTopupAmount(50000);
                          setTopupModalOpen(true);
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Top Up Float
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topup Float Modal */}
      {topupModalOpen && selectedAgentForTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-semibold text-white">Top Up Float Balance</h3>
              <button onClick={() => setTopupModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTopupSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <div className="text-slate-400">Agent:</div>
                <div className="text-sm font-bold text-white font-sans">{selectedAgentForTopup.name}</div>
                <div className="text-slate-500 font-mono">
                  Current Float: {selectedAgentForTopup.balanceTzs.toLocaleString()} TZS
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Top-Up Amount (TZS)</label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-sm font-bold"
                />
              </div>

              <div className="flex gap-2">
                {[20000, 50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono text-slate-300"
                  >
                    {(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                >
                  Credit Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent POS Sale Modal */}
      {posModalOpen && selectedAgentForPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Agent POS Voucher Terminal</h3>
              </div>
              <button
                onClick={() => {
                  setPosModalOpen(false);
                  setSoldVoucherResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs">
              {soldVoucherResult ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-sm">Voucher Sold & Printed!</div>
                    <div className="text-[11px] text-emerald-300">
                      Wholesale deducted from {selectedAgentForPos.name}'s balance.
                    </div>
                  </div>

                  {/* Thermal Slip Preview */}
                  <div className="w-60 mx-auto p-4 bg-white text-black font-mono text-[11px] rounded shadow border leading-tight text-center space-y-2">
                    <div className="font-bold text-xs pb-1 border-b border-dashed border-gray-400">
                      XCLOUD WI-FI TICKET
                      <div className="text-[9px] text-gray-600 font-sans">
                        Agent: {selectedAgentForPos.name}
                      </div>
                    </div>
                    <div className="py-1">
                      <div className="text-sm font-bold">{soldVoucherResult.packageName}</div>
                      <div className="text-base font-bold my-1">{soldVoucherResult.priceTzs.toLocaleString()} TZS</div>
                      <div className="p-2 bg-gray-100 rounded border border-gray-300">
                        <div className="text-[9px] text-gray-500">HOTSPOT CODE:</div>
                        <div className="text-xl font-black tracking-widest text-black">
                          {soldVoucherResult.code}
                        </div>
                        <div className="text-[10px] font-semibold">PIN: {soldVoucherResult.pin}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 pt-1 border-t border-dashed border-gray-400">
                      Connect to Wi-Fi: XCLOUD_HOTSPOT_5G
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSoldVoucherResult(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded font-medium"
                    >
                      Sell Another
                    </button>
                    <button
                      onClick={() => {
                        setPosModalOpen(false);
                        setSoldVoucherResult(null);
                      }}
                      className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-bold rounded"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePosSaleSubmit} className="space-y-4">
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400">Agent:</div>
                      <div className="text-slate-200 font-bold font-sans">{selectedAgentForPos.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400">Float:</div>
                      <div className="text-cyan-400 font-mono font-bold">
                        {selectedAgentForPos.balanceTzs.toLocaleString()} TZS
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Select Customer Plan</label>
                    <select
                      value={selectedPosPackageId}
                      onChange={(e) => setSelectedPosPackageId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                    >
                      {packages.map((pkg) => {
                        const wholesale = pkg.priceTzs * (1 - selectedAgentForPos.commissionRate / 100);
                        const commission = pkg.priceTzs - wholesale;
                        return (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} — Retail: {pkg.priceTzs.toLocaleString()} TZS (Agent earns: {commission.toLocaleString()} TZS)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPosModalOpen(false)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                    >
                      Sell & Print Voucher
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
