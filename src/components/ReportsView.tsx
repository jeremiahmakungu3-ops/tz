import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  HardDrive,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';

export const ReportsView: React.FC = () => {
  const { reports, routers, transactions } = useXCloud();
  const [selectedReportRange, setSelectedReportRange] = useState<'daily' | 'monthly'>('daily');

  const totalPeriodRevenue = reports.reduce((sum, r) => sum + r.revenueTzs, 0);
  const totalPeriodDataGb = reports.reduce((sum, r) => sum + r.dataConsumedGb, 0);
  const totalPeriodVouchers = reports.reduce((sum, r) => sum + r.vouchersActivated, 0);

  const handleExportCsv = () => {
    let csv = 'Date,Revenue_TZS,Revenue_USD,Vouchers_Activated,Peak_Sessions,Data_GB,Mpesa_Pct,Airtel_Pct,Tigo_Pct,Selcom_Pct\n';
    reports.forEach((r) => {
      csv += `"${r.date}",${r.revenueTzs},${r.revenueUsd},${r.vouchersActivated},${r.activeSessionsPeak},${r.dataConsumedGb},${r.gatewayDistribution.mpesa},${r.gatewayDistribution.airtel},${r.gatewayDistribution.tigopesa},${r.gatewayDistribution.selcom}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XCLOUD-billing-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Automated Accounting & Billing Reports
          </h1>
          <p className="text-xs text-slate-400">
            Daily and monthly ISP reconciliation, gateway revenue distribution, and site traffic analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>7-Day Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalPeriodRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-sans">TZS</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-2">
            ≈ ${(totalPeriodRevenue / 2500).toFixed(2)} USD
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Bandwidth Delivered</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalPeriodDataGb.toFixed(1)} <span className="text-xs text-slate-400 font-sans">GB</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Accounting interim updates synced</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Vouchers Consumed</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalPeriodVouchers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">91.4% Activation Success Rate</div>
        </div>
      </div>

      {/* Gateway Revenue Share Breakdown */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="text-sm font-semibold text-white mb-3">
          Mobile Money Gateway Distribution (Last 7 Days)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
              <span>Vodacom M-Pesa</span>
              <span className="font-mono">60%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: '60%' }} />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {(totalPeriodRevenue * 0.6).toLocaleString()} TZS
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
              <span>Airtel Money</span>
              <span className="font-mono">22%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-rose-400" style={{ width: '22%' }} />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {(totalPeriodRevenue * 0.22).toLocaleString()} TZS
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1">
              <span>Tigo Pesa</span>
              <span className="font-mono">12%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-400" style={{ width: '12%' }} />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {(totalPeriodRevenue * 0.12).toLocaleString()} TZS
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-1">
              <span>Selcom Pay</span>
              <span className="font-mono">6%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: '6%' }} />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {(totalPeriodRevenue * 0.06).toLocaleString()} TZS
            </div>
          </div>
        </div>
      </div>

      {/* Daily Audit Ledger Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">Daily Reconciliation Ledger</div>
          <span className="text-xs text-slate-400 font-mono">Automated at 23:59:59 EAT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans text-xs font-medium">
                <th className="pb-3">Calendar Date</th>
                <th className="pb-3">Gross Revenue (TZS)</th>
                <th className="pb-3">USD Equiv.</th>
                <th className="pb-3">Vouchers Generated</th>
                <th className="pb-3">Vouchers Activated</th>
                <th className="pb-3">Peak Users</th>
                <th className="pb-3">Data Consumed</th>
                <th className="pb-3 text-right">Top Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans text-slate-200 font-semibold">{r.date}</td>
                  <td className="py-3 text-white font-bold tabular-nums">
                    {r.revenueTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-3 text-slate-400 tabular-nums">${r.revenueUsd.toFixed(2)}</td>
                  <td className="py-3 text-slate-300 tabular-nums">{r.vouchersGenerated}</td>
                  <td className="py-3 text-emerald-400 font-bold tabular-nums">
                    {r.vouchersActivated}
                  </td>
                  <td className="py-3 text-cyan-300 tabular-nums">{r.activeSessionsPeak}</td>
                  <td className="py-3 text-slate-200 tabular-nums font-semibold">
                    {r.dataConsumedGb} GB
                  </td>
                  <td className="py-3 text-right font-sans text-emerald-400 font-semibold text-[11px]">
                    M-Pesa ({r.gatewayDistribution.mpesa}%)
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
