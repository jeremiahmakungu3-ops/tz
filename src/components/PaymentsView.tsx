import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { PaymentGateway, PaymentTransaction } from '../types';

interface PaymentsViewProps {
  stkPushModalOpen: boolean;
  setStkPushModalOpen: (open: boolean) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  stkPushModalOpen,
  setStkPushModalOpen
}) => {
  const { transactions, packages, routers, triggerStkPush } = useXCloud();

  const [selectedGatewayFilter, setSelectedGatewayFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [inspectPayloadTx, setInspectPayloadTx] = useState<PaymentTransaction | null>(null);

  // STK Push Simulator Form
  const [simPhone, setSimPhone] = useState('+255 754 892 110');
  const [simGateway, setSimGateway] = useState<PaymentGateway>('mpesa');
  const [simPackageId, setSimPackageId] = useState<string>(packages[0]?.id || '');
  const [simRouterId, setSimRouterId] = useState<string>(routers[0]?.id || '');

  // Simulation Stages: 'form' | 'pushing' | 'ussd_prompt' | 'processing' | 'success'
  const [simStage, setSimStage] = useState<'form' | 'pushing' | 'ussd_prompt' | 'processing' | 'success'>('form');
  const [simPin, setSimPin] = useState('1234');
  const [simResultVoucher, setSimResultVoucher] = useState<string | null>(null);

  const selectedPkg = packages.find(p => p.id === simPackageId) || packages[0];

  const handleStartStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    setSimStage('pushing');
    setTimeout(() => {
      setSimStage('ussd_prompt');
    }, 1200);
  };

  const handleConfirmUssd = async () => {
    setSimStage('processing');
    const result = await triggerStkPush({
      phone: simPhone,
      gateway: simGateway,
      packageId: simPackageId,
      routerId: simRouterId,
    });

    if (result.success && result.voucherCode) {
      setSimResultVoucher(result.voucherCode);
      setSimStage('success');
    } else {
      alert(result.message);
      setSimStage('form');
    }
  };

  const handleResetModal = () => {
    setSimStage('form');
    setSimResultVoucher(null);
    setStkPushModalOpen(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (selectedGatewayFilter !== 'all' && t.gateway !== selectedGatewayFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.reference.toLowerCase().includes(q) ||
        t.msisdn.toLowerCase().includes(q) ||
        t.packageName.toLowerCase().includes(q) ||
        (t.voucherCode && t.voucherCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amountTzs, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Mobile Money & Billing</h1>
          <p className="text-xs text-slate-400">
            Native integrations with M-Pesa Daraja, Airtel Money, Tigo Pesa, and Selcom Gateways
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 mr-1.5">Processed:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {totalRevenue.toLocaleString()} TZS
            </span>
          </div>
          <button
            onClick={() => {
              setSimStage('form');
              setStkPushModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-md transition-colors shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulate STK Push</span>
          </button>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* M-Pesa */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">Vodacom / Safaricom</span>
              <span className="text-[11px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="text-base font-bold text-white mb-1">M-Pesa Daraja C2B</div>
            <div className="text-xs text-slate-400">
              Shortcode: <span className="font-mono text-slate-300">592019</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3 text-[11px] text-slate-500 font-mono">
            Instant STK Push · 99.4% Uptime
          </div>
        </div>

        {/* Airtel Money */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400">Airtel Africa</span>
              <span className="text-[11px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="text-base font-bold text-white mb-1">Airtel Money API</div>
            <div className="text-xs text-slate-400">
              Client ID: <span className="font-mono text-slate-300">xcl_airtel_tz</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3 text-[11px] text-slate-500 font-mono">
            Merchant Paybill · Webhook IPN
          </div>
        </div>

        {/* Tigo Pesa */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400">Yas / Tigo</span>
              <span className="text-[11px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="text-base font-bold text-white mb-1">Tigo Pesa Gateway</div>
            <div className="text-xs text-slate-400">
              Biller ID: <span className="font-mono text-slate-300">991442</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3 text-[11px] text-slate-500 font-mono">
            Direct USSD Push Notification
          </div>
        </div>

        {/* Selcom */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400">Selcom Tanzania</span>
              <span className="text-[11px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="text-base font-bold text-white mb-1">Selcom Pay / Cards</div>
            <div className="text-xs text-slate-400">
              Vendor ID: <span className="font-mono text-slate-300">SELCOM-XC-901</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/80 mt-3 text-[11px] text-slate-500 font-mono">
            Mastercard QR & Multi-wallet
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'mpesa', 'airtel', 'tigopesa', 'selcom'].map((gw) => (
            <button
              key={gw}
              onClick={() => setSelectedGatewayFilter(gw)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedGatewayFilter === gw
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {gw === 'all' ? 'All Gateways' : gw.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ref, phone, voucher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-400 font-mono w-full sm:w-64"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Transaction Reference</th>
                <th className="pb-3">Customer Phone</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Package Purchased</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Voucher Code</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Webhook Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{tx.reference}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{tx.createdAt.split('T')[0]}</div>
                  </td>
                  <td className="py-3 text-slate-300">{tx.msisdn}</td>
                  <td className="py-3 font-sans">
                    <span
                      className={`text-[11px] font-bold uppercase ${
                        tx.gateway === 'mpesa'
                          ? 'text-emerald-400'
                          : tx.gateway === 'airtel'
                          ? 'text-rose-400'
                          : tx.gateway === 'tigopesa'
                          ? 'text-blue-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {tx.gateway}
                    </span>
                  </td>
                  <td className="py-3 font-sans text-slate-300">{tx.packageName}</td>
                  <td className="py-3 text-slate-100 font-semibold tabular-nums">
                    {tx.amountTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-3">
                    {tx.voucherCode ? (
                      <span className="text-cyan-300 font-bold tracking-wider">{tx.voucherCode}</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        tx.status === 'completed'
                          ? 'text-emerald-400'
                          : tx.status === 'pending'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    <button
                      onClick={() => setInspectPayloadTx(tx)}
                      className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3 text-cyan-400" />
                      <span>Inspect IPN</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive STK Push Simulator Modal */}
      {stkPushModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Mobile Money STK Push Simulator</h3>
              </div>
              <button onClick={handleResetModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {simStage === 'form' && (
                <form onSubmit={handleStartStkPush} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Select Mobile Money Provider</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'mpesa', name: 'M-Pesa', color: 'emerald' },
                        { id: 'airtel', name: 'Airtel Money', color: 'rose' },
                        { id: 'tigopesa', name: 'Tigo Pesa', color: 'blue' },
                        { id: 'selcom', name: 'Selcom Pay', color: 'cyan' },
                      ].map((gw) => (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setSimGateway(gw.id as PaymentGateway)}
                          className={`p-2 rounded-lg border text-center font-medium transition-all ${
                            simGateway === gw.id
                              ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {gw.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Customer Phone Number (MSISDN)</label>
                    <input
                      type="text"
                      required
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      placeholder="+255 754 123 456"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Format: +255 7XX XXX XXX or +254 7XX XXX XXX
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Select Hotspot Access Plan</label>
                    <select
                      value={simPackageId}
                      onChange={(e) => setSimPackageId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.priceTzs.toLocaleString()} TZS ({pkg.rateLimitRx}/{pkg.rateLimitTx})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Hotspot Location</label>
                    <select
                      value={simRouterId}
                      onChange={(e) => setSimRouterId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                    >
                      {routers.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded transition-all shadow-md"
                    >
                      Send STK Push Request
                    </button>
                  </div>
                </form>
              )}

              {simStage === 'pushing' && (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-white">
                    Sending USSD Push to {simPhone}...
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Calling {simGateway.toUpperCase()} API endpoint /v1/processrequest
                  </div>
                </div>
              )}

              {simStage === 'ussd_prompt' && (
                <div className="space-y-4">
                  {/* Phone Screen Mockup */}
                  <div className="w-full max-w-xs mx-auto p-4 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl shadow-xl font-mono text-center text-xs space-y-3">
                    <div className="text-emerald-400 font-bold uppercase tracking-wider">
                      {simGateway === 'mpesa' ? 'Vodacom M-Pesa' : simGateway.toUpperCase()}
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      Do you want to pay <span className="text-white font-bold">{selectedPkg.priceTzs.toLocaleString()} TZS</span> to XCLOUD HOTSPOT for <span className="text-cyan-300">{selectedPkg.name}</span>?
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Enter your Mobile PIN:</div>
                      <input
                        type="password"
                        maxLength={4}
                        value={simPin}
                        onChange={(e) => setSimPin(e.target.value)}
                        className="w-28 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-bold tracking-widest text-base focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={handleResetModal}
                        className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-sans text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmUssd}
                        className="py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded font-sans text-xs"
                      >
                        Send PIN
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {simStage === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-white">
                    Verifying PIN & Processing Transaction...
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Awaiting IPN webhook callback at /api/payments/webhooks/
                  </div>
                </div>
              )}

              {simStage === 'success' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-base font-bold text-white">Payment Successful!</div>
                    <div className="text-xs text-emerald-300">
                      Confirmed via {simGateway.toUpperCase()} IPN Webhook. Voucher issued instantly.
                    </div>
                  </div>

                  {/* Customer Phone SMS Notification Mockup */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS Sent to {simPhone}:</span>
                    </div>
                    <div className="text-xs font-mono text-slate-300 bg-slate-900/80 p-3 rounded border border-slate-800 leading-relaxed">
                      "Payment of {selectedPkg.priceTzs.toLocaleString()} TZS received! Your XCLOUD Hotspot Voucher Code is: <span className="text-cyan-300 font-bold">{simResultVoucher}</span>. Connect to Wi-Fi SSID 'XCLOUD_HOTSPOT_5G' and enter this code to enjoy high speed internet!"
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleResetModal}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Webhook JSON Payload Inspector Modal */}
      {inspectPayloadTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  IPN Webhook Payload: {inspectPayloadTx.reference}
                </h3>
              </div>
              <button onClick={() => setInspectPayloadTx(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 overflow-y-auto max-h-96 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  inspectPayloadTx.webhookPayload || {
                    status: '200 OK',
                    gateway: inspectPayloadTx.gateway,
                    reference: inspectPayloadTx.reference,
                    phone: inspectPayloadTx.msisdn,
                    amount: inspectPayloadTx.amountTzs,
                    timestamp: inspectPayloadTx.createdAt,
                    result: 'SUCCESS'
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/70 text-xs">
              <span className="text-slate-400 font-mono">HTTP 200 Handshake OK</span>
              <button
                onClick={() => setInspectPayloadTx(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
