import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Printer,
  Search,
  Filter,
  Download,
  QrCode,
  Wifi,
  Clock,
  Sparkles,
  X,
  Check,
  CheckCircle,
  Copy,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { HotspotPackage, Voucher, VoucherStatus } from '../types';

export const VouchersView: React.FC<{ initialOpenGenerator?: boolean }> = ({ initialOpenGenerator = false }) => {
  const { packages, vouchers, generateVouchers, invalidateVoucher, routers, addPackage } = useXCloud();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  const [generatorOpen, setGeneratorOpen] = useState(initialOpenGenerator);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<Voucher | null>(null);
  const [printBatchId, setPrintBatchId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'thermal' | 'grid'>('thermal');

  // Generator form
  const [genPackageId, setGenPackageId] = useState<string>(packages[0]?.id || '');
  const [genRouterId, setGenRouterId] = useState<string>(routers[0]?.id || 'all');
  const [genQuantity, setGenQuantity] = useState<number>(10);
  const [genBatchName, setGenBatchName] = useState<string>('');
  const [genCodeLength, setGenCodeLength] = useState<number>(6);
  const [genIsNumeric, setGenIsNumeric] = useState<boolean>(true);
  const [generatedResults, setGeneratedResults] = useState<Voucher[]>([]);

  // Add package modal
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const [newPkgData, setNewPkgData] = useState({
    name: '',
    priceTzs: 2000,
    priceUsd: 0.80,
    durationMinutes: 1440,
    rateLimitRx: '10M',
    rateLimitTx: '5M',
    sharedUsers: 1,
    description: '',
    color: 'cyan',
  });

  // Unique batches
  const batches = Array.from(new Set(vouchers.map(v => v.batchId)));

  // Filter vouchers
  const filteredVouchers = vouchers.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (selectedBatch !== 'all' && v.batchId !== selectedBatch) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        v.pin.toLowerCase().includes(q) ||
        v.packageName.toLowerCase().includes(q) ||
        (v.macAddress && v.macAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = generateVouchers({
      packageId: genPackageId || packages[0].id,
      routerId: genRouterId,
      quantity: genQuantity,
      batchName: genBatchName || `Batch ${new Date().toLocaleDateString()}`,
      codeLength: genCodeLength,
      isNumericOnly: genIsNumeric,
    });
    setGeneratedResults(created);
  };

  const handlePrintSingle = (v: Voucher) => {
    setSelectedVoucherForPrint(v);
    setPrintBatchId(null);
    setPrintModalOpen(true);
  };

  const handlePrintBatch = (batchId: string) => {
    setPrintBatchId(batchId);
    setSelectedVoucherForPrint(null);
    setPrintModalOpen(true);
  };

  const vouchersToPrint: Voucher[] = printBatchId
    ? vouchers.filter(v => v.batchId === printBatchId)
    : selectedVoucherForPrint
    ? [selectedVoucherForPrint]
    : [];

  const handleAddPackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgData.name) return;
    addPackage(newPkgData);
    setAddPackageOpen(false);
    setNewPkgData({
      name: '',
      priceTzs: 2000,
      priceUsd: 0.80,
      durationMinutes: 1440,
      rateLimitRx: '10M',
      rateLimitTx: '5M',
      sharedUsers: 1,
      description: '',
      color: 'cyan',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Hotspot Packages & Vouchers</h1>
          <p className="text-xs text-slate-400">
            Create rate-limited bandwidth plans, generate batches, and print thermal POS tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddPackageOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Package</span>
          </button>
          <button
            onClick={() => {
              setGeneratedResults([]);
              setGeneratorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Generate Vouchers</span>
          </button>
        </div>
      </div>

      {/* Hotspot Packages Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-200 truncate">{pkg.name}</span>
                <span className="text-[11px] font-mono font-bold text-cyan-400">
                  {pkg.rateLimitRx}/{pkg.rateLimitTx}
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {pkg.priceTzs.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">TZS</span>
                <span className="text-[11px] text-slate-500 font-mono ml-auto">(${pkg.priceUsd})</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {pkg.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{Math.round(pkg.durationMinutes / 60)}h validity</span>
              <span className="text-emerald-400 font-mono">{pkg.activeVouchersCount || 0} active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'available', 'active', 'used', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${vouchers.length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Batch selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, PIN, MAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-400 font-mono w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Voucher Code & PIN</th>
                <th className="pb-3">Package / Plan</th>
                <th className="pb-3">Assigned Site</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Speed Limit</th>
                <th className="pb-3">Batch Reference</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold text-sm tracking-wider">{v.code}</span>
                      <span className="text-slate-500 font-sans text-[11px]">PIN:</span>
                      <span className="text-slate-300 font-medium">{v.pin}</span>
                    </div>
                    {v.macAddress && (
                      <div className="text-[11px] text-slate-500 font-mono">{v.macAddress}</div>
                    )}
                  </td>
                  <td className="py-2.5 font-sans text-slate-200 font-medium">
                    {v.packageName}
                  </td>
                  <td className="py-2.5 font-sans text-slate-400">{v.routerName}</td>
                  <td className="py-2.5 text-slate-200 tabular-nums">
                    {v.priceTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-2.5 text-cyan-400">{v.rateLimit}</td>
                  <td className="py-2.5 text-[11px] text-slate-400 truncate max-w-[140px]">
                    {v.batchId}
                  </td>
                  <td className="py-2.5 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        v.status === 'available'
                          ? 'text-emerald-400'
                          : v.status === 'active'
                          ? 'text-cyan-400'
                          : v.status === 'used'
                          ? 'text-slate-400'
                          : 'text-rose-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          v.status === 'available'
                            ? 'bg-emerald-400'
                            : v.status === 'active'
                            ? 'bg-cyan-400'
                            : v.status === 'used'
                            ? 'bg-slate-500'
                            : 'bg-rose-400'
                        }`}
                      />
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrintSingle(v)}
                        title="Print POS Thermal Slip"
                        className="px-2 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-cyan-400" />
                        <span>Print</span>
                      </button>
                      {v.status === 'available' && (
                        <button
                          onClick={() => invalidateVoucher(v.id)}
                          title="Invalidate / Expire voucher"
                          className="px-2 py-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Generator Modal */}
      {generatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Generate Bulk Hotspot Vouchers</h3>
              </div>
              <button onClick={() => setGeneratorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {generatedResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Successfully generated {generatedResults.length} vouchers!</span>
                    </div>
                    <button
                      onClick={() => handlePrintBatch(generatedResults[0].batchId)}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-semibold rounded text-xs flex items-center gap-1 hover:bg-emerald-400"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Batch Now</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 max-h-56 overflow-y-auto space-y-1.5 font-mono">
                    {generatedResults.map((v, i) => (
                      <div key={v.id} className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-500">#{i + 1}</span>
                        <span className="text-cyan-300 font-bold text-sm">{v.code}</span>
                        <span className="text-slate-400">PIN: {v.pin}</span>
                        <span className="text-slate-300 font-sans">{v.packageName}</span>
                        <span className="text-emerald-400">{v.priceTzs.toLocaleString()} TZS</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setGeneratedResults([])}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Generate Another Batch
                    </button>
                    <button
                      onClick={() => setGeneratorOpen(false)}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Select Hotspot Package</label>
                    <select
                      value={genPackageId}
                      onChange={(e) => setGenPackageId(e.target.value)}
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
                    <label className="block text-slate-400 font-medium mb-1">Target Router Location</label>
                    <select
                      value={genRouterId}
                      onChange={(e) => setGenRouterId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                    >
                      <option value="all">All Routers (Global Hotspot Roaming)</option>
                      {routers.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.identity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Quantity</label>
                      <select
                        value={genQuantity}
                        onChange={(e) => setGenQuantity(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                      >
                        <option value={1}>1 Voucher (Instant POS)</option>
                        <option value={5}>5 Vouchers</option>
                        <option value={10}>10 Vouchers</option>
                        <option value={25}>25 Vouchers</option>
                        <option value={50}>50 Vouchers</option>
                        <option value={100}>100 Vouchers (Reseller Sheet)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Code Format</label>
                      <select
                        value={genIsNumeric ? 'numeric' : 'alphanumeric'}
                        onChange={(e) => setGenIsNumeric(e.target.value === 'numeric')}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                      >
                        <option value="numeric">Numbers Only (Easy Phone Typing)</option>
                        <option value="alphanumeric">Alphanumeric (Extra Secure)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Batch Label / Memo</label>
                    <input
                      type="text"
                      placeholder="e.g. Kariakoo Monday Morning Resellers"
                      value={genBatchName}
                      onChange={(e) => setGenBatchName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setGeneratorOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                    >
                      Generate {genQuantity} Vouchers
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Vouchers Modal (POS Thermal 58mm / 80mm & Scratch Card Grid) */}
      {printModalOpen && vouchersToPrint.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  Print Vouchers ({vouchersToPrint.length} item{vouchersToPrint.length > 1 ? 's' : ''})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800 p-0.5 rounded text-[11px]">
                  <button
                    onClick={() => setPrintMode('thermal')}
                    className={`px-2.5 py-1 rounded ${printMode === 'thermal' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
                  >
                    POS Thermal (58mm)
                  </button>
                  <button
                    onClick={() => setPrintMode('grid')}
                    className={`px-2.5 py-1 rounded ${printMode === 'grid' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}
                  >
                    Scratch Card Grid (A4)
                  </button>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="text-slate-400 hover:text-white ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Preview Container */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950 flex justify-center">
              {printMode === 'thermal' ? (
                /* Thermal 58mm POS receipt layout */
                <div className="space-y-4">
                  {vouchersToPrint.slice(0, 3).map((v) => (
                    <div
                      key={v.id}
                      className="w-64 p-4 bg-white text-black font-mono text-[11px] rounded shadow-lg border border-slate-200 leading-tight space-y-2"
                    >
                      <div className="text-center pb-2 border-b border-dashed border-gray-400">
                        <div className="text-sm font-bold tracking-tight">XCLOUD HIGH SPEED WI-FI</div>
                        <div className="text-[10px] text-gray-600">SSID: XCLOUD_HOTSPOT_5G</div>
                        <div className="text-[9px] text-gray-500">{v.routerName}</div>
                      </div>

                      <div className="py-2 text-center border-b border-dashed border-gray-400">
                        <div className="text-[10px] text-gray-600 uppercase">{v.packageName}</div>
                        <div className="text-base font-bold my-0.5">{v.priceTzs.toLocaleString()} TZS</div>
                        <div className="text-[10px] text-gray-600 font-sans">
                          Validity: {Math.round(v.durationMinutes / 60)} Hours · Speed: {v.rateLimit}
                        </div>
                      </div>

                      <div className="p-2 bg-gray-100 rounded text-center my-2 border border-gray-300">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest">VOUCHER CODE</div>
                        <div className="text-xl font-black tracking-widest my-1">{v.code}</div>
                        <div className="text-[11px] font-semibold">PIN: {v.pin}</div>
                      </div>

                      <div className="flex items-center justify-center p-2 bg-gray-50 rounded border border-gray-200 gap-2">
                        <QrCode className="w-9 h-9 text-gray-800" />
                        <div className="text-[9px] text-left leading-tight text-gray-600">
                          Scan to connect or visit:
                          <div className="font-bold text-black">http://wifi.login</div>
                        </div>
                      </div>

                      <div className="text-[9px] text-center text-gray-500 pt-1">
                        Support Hotline: +255 700 000 000
                        <div>Ref: {v.id}</div>
                      </div>
                    </div>
                  ))}
                  {vouchersToPrint.length > 3 && (
                    <div className="text-center text-xs text-slate-400 py-2">
                      ...and {vouchersToPrint.length - 3} more vouchers in this print queue
                    </div>
                  )}
                </div>
              ) : (
                /* Multi Card Grid (A4 sheet scratchcards) */
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {vouchersToPrint.slice(0, 6).map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-lg border-2 border-dashed border-cyan-500/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          <span className="font-bold text-[11px] tracking-tight">XCLOUD WI-FI</span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400 font-mono">
                          {v.priceTzs.toLocaleString()} TZS
                        </span>
                      </div>
                      <div className="my-2 text-center">
                        <div className="text-[10px] text-slate-400">{v.packageName}</div>
                        <div className="text-lg font-bold font-mono tracking-widest text-cyan-300">
                          {v.code}
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono">PIN: {v.pin}</div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800 font-mono">
                        <span>wifi.login</span>
                        <span>{v.rateLimit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Print Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/70">
              <span className="text-xs text-slate-400">
                Ready for ESC/POS Thermal or Standard A4 Laser printer
              </span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Send to Printer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {addPackageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-semibold text-white">Create Hotspot Package</h3>
              <button onClick={() => setAddPackageOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPackageSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12 Hours Night Owl"
                  value={newPkgData.name}
                  onChange={(e) => setNewPkgData({ ...newPkgData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    required
                    value={newPkgData.priceTzs}
                    onChange={(e) =>
                      setNewPkgData({
                        ...newPkgData,
                        priceTzs: parseInt(e.target.value) || 0,
                        priceUsd: parseFloat(((parseInt(e.target.value) || 0) / 2500).toFixed(2)),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPkgData.priceUsd}
                    onChange={(e) => setNewPkgData({ ...newPkgData, priceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Download Speed (Rx)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10M"
                    value={newPkgData.rateLimitRx}
                    onChange={(e) => setNewPkgData({ ...newPkgData, rateLimitRx: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Upload Speed (Tx)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5M"
                    value={newPkgData.rateLimitTx}
                    onChange={(e) => setNewPkgData({ ...newPkgData, rateLimitTx: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={newPkgData.durationMinutes}
                    onChange={(e) => setNewPkgData({ ...newPkgData, durationMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Shared Devices</label>
                  <input
                    type="number"
                    value={newPkgData.sharedUsers}
                    onChange={(e) => setNewPkgData({ ...newPkgData, sharedUsers: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newPkgData.description}
                  onChange={(e) => setNewPkgData({ ...newPkgData, description: e.target.value })}
                  placeholder="e.g. Fast 10Mbps unlimited access for one evening."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddPackageOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
