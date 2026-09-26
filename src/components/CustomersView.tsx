import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Smartphone,
  Laptop,
  Tablet,
  CreditCard,
  Trash2,
  CheckCircle2,
  X,
  Shield,
  Clock
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { Customer, DeviceType } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, removeCustomerMac } = useXCloud();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getDeviceIcon = (type?: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-3 h-3 text-cyan-400 shrink-0" />;
      case 'tablet':
        return <Tablet className="w-3 h-3 text-purple-400 shrink-0" />;
      case 'android':
        return <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />;
      case 'iphone':
        return <Smartphone className="w-3 h-3 text-rose-400 shrink-0" />;
      default:
        return <Laptop className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.phone.includes(search) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      c.macAddresses.some((m) => m.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustPhone) return;
    addCustomer(newCustPhone, newCustName);
    setAddModalOpen(false);
    setNewCustPhone('');
    setNewCustName('');
    setToastMsg(`Customer account created for ${newCustPhone}.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUnbindMac = (customerId: string, mac: string) => {
    removeCustomerMac(customerId, mac);
    setToastMsg(`Unbound MAC address ${mac}. Customer can now bind a new device.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpentTzs, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Customer Accounts & CRM</h1>
          <p className="text-xs text-slate-400">
            Subscriber directory, multi-device MAC address bindings, and lifetime billing history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 mr-1.5">Total Spend:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {totalSpentAll.toLocaleString()} TZS
            </span>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search phone number, name, or MAC address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Customer Phone & Name</th>
                <th className="pb-3">Bound Device MAC Addresses</th>
                <th className="pb-3">Vouchers Purchased</th>
                <th className="pb-3">Total Spend</th>
                <th className="pb-3">First Seen</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans">
                    <div className="font-semibold text-slate-200">{cust.phone}</div>
                    <div className="text-[11px] text-slate-400">{cust.name || 'Anonymous User'}</div>
                  </td>
                  <td className="py-3">
                    {cust.devices && cust.devices.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {cust.devices.map((dev) => (
                          <div
                            key={dev.id}
                            className="inline-flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {getDeviceIcon(dev.type)}
                              <span className="font-sans font-medium text-slate-200">{dev.name}:</span>
                              <span className="text-slate-400 font-mono text-[10px]">{dev.mac}</span>
                            </div>
                            <button
                              onClick={() => handleUnbindMac(cust.id, dev.mac)}
                              title="Unlink device MAC address"
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : cust.macAddresses.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cust.macAddresses.map((mac) => (
                          <div
                            key={mac}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                          >
                            <Laptop className="w-3 h-3 text-cyan-400" />
                            <span>{mac}</span>
                            <button
                              onClick={() => handleUnbindMac(cust.id, mac)}
                              title="Unlink device MAC address"
                              className="text-slate-500 hover:text-rose-400 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-sans text-[11px]">No MAC registered</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-200 tabular-nums font-semibold">
                    {cust.vouchersPurchased}
                  </td>
                  <td className="py-3 text-emerald-400 font-bold tabular-nums">
                    {cust.totalSpentTzs.toLocaleString()} TZS
                  </td>
                  <td className="py-3 text-slate-400 font-sans">{cust.firstSeen}</td>
                  <td className="py-3 text-slate-300 font-sans">{cust.lastSeen}</td>
                  <td className="py-3 text-right font-sans">
                    <span className="text-emerald-400 text-[11px] font-semibold">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-semibold text-white">Add Customer Account</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Customer Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+255 7XX XXX XXX"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. John Mwangi"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
