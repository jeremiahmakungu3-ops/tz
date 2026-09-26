import React, { useState } from 'react';
import {
  Wifi,
  Smartphone,
  Laptop,
  Tablet,
  CreditCard,
  Ticket,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Radio,
  QrCode,
  Share2,
  Plus,
  Trash2,
  Copy,
  Check,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useXCloud } from '../context/XCloudContext';
import { PaymentGateway, DeviceType, ConnectedDevice } from '../types';

export const CaptivePortalView: React.FC = () => {
  const {
    packages,
    routers,
    portalSession,
    switchPortalDevice,
    addFriendDevice,
    removeFriendDevice,
    loginPortalWithVoucher,
    loginPortalWithMobileMoney,
    logoutPortal,
    pipelineLogs,
  } = useXCloud();

  const [activeTab, setActiveTab] = useState<'mobile_money' | 'voucher'>('mobile_money');

  // Mobile Money Form State
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[2]?.id || packages[0]?.id || '');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('mpesa');
  const [customerPhone, setCustomerPhone] = useState('0754 892 110');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voucher Form State
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPin, setVoucherPin] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Friend / Multi-Device Sharing State
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [friendDeviceName, setFriendDeviceName] = useState('');
  const [friendDeviceType, setFriendDeviceType] = useState<DeviceType>('laptop');
  const [friendCustomMac, setFriendCustomMac] = useState('');
  const [friendAdding, setFriendAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendSuccessMsg, setFriendSuccessMsg] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handleMobileMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessStep('1/5: Initiating M-Pesa / Mobile USSD Push...');

    setTimeout(() => {
      setProcessStep('2/5: Customer entering PIN on handset...');
    }, 1200);

    setTimeout(() => {
      setProcessStep('3/5: IPN Webhook verified (ResultCode: 0)...');
    }, 2400);

    setTimeout(() => {
      setProcessStep('4/5: FreeRADIUS authorizing MAC address...');
    }, 3200);

    const result = await loginPortalWithMobileMoney({
      phone: customerPhone,
      gateway: selectedGateway,
      packageId: selectedPkgId,
      routerId: routers[0]?.id || 'rtr-01',
    });

    setIsProcessing(false);
    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode) return;
    setVoucherLoading(true);
    setErrorMsg(null);

    const result = await loginPortalWithVoucher(voucherCode, voucherPin);
    setVoucherLoading(false);
    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendDeviceName.trim()) return;
    setFriendAdding(true);
    setErrorMsg(null);

    const res = await addFriendDevice(
      friendDeviceName.trim(),
      friendDeviceType,
      friendCustomMac.trim() || undefined
    );

    setFriendAdding(false);
    if (res.success) {
      setFriendSuccessMsg(res.message);
      setFriendDeviceName('');
      setFriendCustomMac('');
      setTimeout(() => setFriendSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'android':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'iphone':
        return <Smartphone className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Multi-Device Hotspot Captive Portal
          </h1>
          <p className="text-xs text-slate-400">
            Simulate Laptop, Tablet, Android, or iPhone users with instant mobile activation & friend device sharing
          </p>
        </div>

        {/* Device Switcher Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
          <span className="text-[11px] text-slate-500 font-sans px-2 hidden sm:inline">Active View:</span>
          {(
            [
              { type: 'iphone' as DeviceType, label: 'iPhone (iOS)', icon: <Smartphone className="w-3.5 h-3.5" /> },
              { type: 'android' as DeviceType, label: 'Android Phone', icon: <Smartphone className="w-3.5 h-3.5" /> },
              { type: 'tablet' as DeviceType, label: 'iPad / Tablet', icon: <Tablet className="w-3.5 h-3.5" /> },
              { type: 'laptop' as DeviceType, label: 'MacBook / Laptop', icon: <Laptop className="w-3.5 h-3.5" /> },
            ]
          ).map((item) => (
            <button
              key={item.type}
              onClick={() => switchPortalDevice(item.type)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                portalSession.deviceType === item.type
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Adaptive Device Frame (lg:col-span-6) */}
        <div className="lg:col-span-6 flex justify-center">
          {/* Frame styling adjusts according to deviceType (Laptop vs Tablet vs Phone) */}
          <div
            className={`w-full transition-all duration-300 bg-slate-950 border-4 border-slate-800 shadow-2xl p-4 relative overflow-hidden flex flex-col ${
              portalSession.deviceType === 'laptop'
                ? 'max-w-xl rounded-2xl min-h-[580px]'
                : portalSession.deviceType === 'tablet'
                ? 'max-w-md rounded-[28px] min-h-[620px]'
                : 'max-w-sm rounded-[36px] min-h-[640px]'
            }`}
          >
            {/* Top Device Header: Laptop window vs Smartphone notch */}
            {portalSession.deviceType === 'laptop' ? (
              <div className="pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">XCLOUD Captive Assistant — Chrome</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">macOS Sonoma · Wi-Fi Connected</div>
              </div>
            ) : (
              <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-auto mr-3"></div>
              </div>
            )}

            {/* Browser Address Bar */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 mb-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate text-slate-200">http://wifi.login</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="uppercase">{portalSession.deviceType}</span>
              </div>
            </div>

            {/* Portal Content Inside Device Frame */}
            {portalSession.isAuthenticated ? (
              /* State 2: Authenticated / Online View */
              <div className="flex-1 flex flex-col justify-between py-1 text-center">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white">Device Connected to Internet!</h2>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">
                      {portalSession.packageName} · Speed: {portalSession.rateLimit}
                    </p>
                  </div>

                  {/* Telemetry Card */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-slate-500">Time Remaining:</span>
                      <span className="text-cyan-300 font-bold tabular-nums">
                        {Math.floor(portalSession.timeLeftMinutes / 60)}h{' '}
                        {portalSession.timeLeftMinutes % 60}m
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-slate-500">Active Device:</span>
                      <span className="text-white flex items-center gap-1">
                        {getDeviceIcon(portalSession.deviceType)}
                        <span>{portalSession.deviceType.toUpperCase()} ({portalSession.deviceMac})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-slate-500">Traffic Transferred:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {portalSession.bytesUsedMb.toFixed(1)} MB
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Shared Device Slots:</span>
                      <span className="text-purple-400 font-bold">
                        {portalSession.connectedDevices.length} / {portalSession.maxSharedDevices} in use
                      </span>
                    </div>
                  </div>

                  {/* Multi-Device Friend List */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Connected Devices & Friends</span>
                      </div>
                      {portalSession.connectedDevices.length < portalSession.maxSharedDevices && (
                        <button
                          onClick={() => setFriendModalOpen(true)}
                          className="px-2 py-0.5 text-[11px] font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Friend Device</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {portalSession.connectedDevices.map((dev) => (
                        <div
                          key={dev.id}
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(dev.type)}
                            <div>
                              <div className="text-slate-200 font-sans font-medium text-[11px] flex items-center gap-1">
                                <span>{dev.name}</span>
                                {dev.isCurrentDevice && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {dev.os} · {dev.mac}
                              </div>
                            </div>
                          </div>

                          {!dev.isCurrentDevice && (
                            <button
                              onClick={() => removeFriendDevice(dev.id)}
                              title="Disconnect friend's device"
                              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={logoutPortal}
                    className="w-full py-2 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Internet Session</span>
                  </button>
                </div>
              </div>
            ) : (
              /* State 1: Unauthenticated Captive Portal Login */
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  {/* Branding lockup */}
                  <div className="text-center mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto mb-1.5 font-black text-sm">
                      XC
                    </div>
                    <h2 className="text-sm font-bold text-white tracking-tight">XCLOUD HOTSPOT</h2>
                    <p className="text-[11px] text-slate-400">
                      Connecting from: <span className="text-cyan-400 font-semibold uppercase">{portalSession.deviceType}</span>
                    </p>
                  </div>

                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-lg mb-3 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('mobile_money')}
                      className={`py-1.5 rounded-md transition-all ${
                        activeTab === 'mobile_money'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Instant Mobile Pay
                    </button>
                    <button
                      onClick={() => setActiveTab('voucher')}
                      className={`py-1.5 rounded-md transition-all ${
                        activeTab === 'voucher'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Enter Voucher
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mb-3 p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Tab A: Mobile Money Auto-Activation */}
                  {activeTab === 'mobile_money' && (
                    <form onSubmit={handleMobileMoneySubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 text-[11px] font-medium mb-1">
                          Choose Package (Multi-Device Support):
                        </label>
                        <select
                          value={selectedPkgId}
                          onChange={(e) => setSelectedPkgId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 text-[11px] font-sans"
                        >
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} — {pkg.priceTzs.toLocaleString()} TZS ({pkg.sharedUsers} devices allowed)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-medium mb-1">
                          Payment Provider:
                        </label>
                        <div className="grid grid-cols-4 gap-1">
                          {(['mpesa', 'airtel', 'tigopesa', 'selcom'] as PaymentGateway[]).map(
                            (gw) => (
                              <button
                                key={gw}
                                type="button"
                                onClick={() => setSelectedGateway(gw)}
                                className={`py-1 rounded border text-[10px] font-bold uppercase transition-all ${
                                  selectedGateway === gw
                                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                                    : 'border-slate-800 bg-slate-900 text-slate-400'
                                }`}
                              >
                                {gw === 'tigopesa' ? 'Tigo' : gw === 'airtel' ? 'Airtel' : gw}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-medium mb-1">
                          Mobile Number (MSISDN):
                        </label>
                        <input
                          type="text"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. 0754 123 456"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                        />
                      </div>

                      {isProcessing ? (
                        <div className="py-3 px-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-center space-y-1.5">
                          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
                          <div className="text-[11px] font-mono text-cyan-300">{processStep}</div>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          className="w-full py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            Pay {selectedPkg.priceTzs.toLocaleString()} TZS & Auto-Connect
                          </span>
                        </button>
                      )}
                    </form>
                  )}

                  {/* Tab B: Voucher Code Login */}
                  {activeTab === 'voucher' && (
                    <form onSubmit={handleVoucherSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 text-[11px] font-medium mb-1">
                          Voucher Code:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 829104"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded text-white font-mono font-bold text-center tracking-widest text-sm focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-medium mb-1">
                          PIN (if printed on card):
                        </label>
                        <input
                          type="password"
                          placeholder="4-digit PIN"
                          value={voucherPin}
                          onChange={(e) => setVoucherPin(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white font-mono text-center tracking-widest text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={voucherLoading}
                        className="w-full py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
                      >
                        {voucherLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>{voucherLoading ? 'Authenticating...' : 'Connect to Internet'}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Mobile footer */}
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center">
                  Device MAC: {portalSession.deviceMac}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Device Architecture & Friend Linking (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Multi-Device Sharing Architecture */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">
                  Multi-Device & Friend Sharing Engine
                </h2>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                MikroTik Hotspot & RADIUS
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a subscriber purchases a package allowing multiple shared devices (e.g., 2 devices on
              the 24-Hour plan or 4 devices on the 30-Day SME plan), their friends or family can connect
              their <strong>Laptop</strong>, <strong>Tablet</strong>, <strong>Android</strong>, or{' '}
              <strong>iPhone</strong> without paying twice:
            </p>

            {/* Device Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptops (Mac & Win)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Desktop browser captive assistant auto-detects DNS redirect. Dynamic queue allocates 10M bandwidth.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablets (iPad & Tab)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Tablet MAC address bound to same voucher. Roams seamlessly across all access points.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android Devices</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Responds to Android Captive Check (HTTP 204). Instant authorization via FreeRADIUS.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhones (Apple iOS)</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Apple CNA (Captive Network Assistant) triggers auto-close prompt when access is granted.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Friend Invite Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Share Wi-Fi with a Friend</h3>
              </div>
              <button
                onClick={() => setFriendModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Link Friend's Device</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Generate an instant Wi-Fi pairing token or invite link for your friend's laptop, tablet, or phone:
            </p>

            <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <span className="text-cyan-400 font-bold truncate flex-1">
                http://wifi.login/invite?ref=829104&token=share_77f
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('http://wifi.login/invite?ref=829104&token=share_77f');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-sans flex items-center gap-1 transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Friend Device Modal */}
      {friendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Add Friend's Device</h3>
              </div>
              <button onClick={() => setFriendModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="p-5 space-y-3.5 text-xs">
              {friendSuccessMsg && (
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{friendSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Friend / Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex's Laptop or David's Tablet"
                  value={friendDeviceName}
                  onChange={(e) => setFriendDeviceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Friend's Hardware</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { type: 'laptop' as DeviceType, label: 'Laptop (PC/Mac)', icon: <Laptop className="w-3.5 h-3.5" /> },
                      { type: 'tablet' as DeviceType, label: 'Tablet / iPad', icon: <Tablet className="w-3.5 h-3.5" /> },
                      { type: 'android' as DeviceType, label: 'Android Phone', icon: <Smartphone className="w-3.5 h-3.5" /> },
                      { type: 'iphone' as DeviceType, label: 'iPhone (iOS)', icon: <Smartphone className="w-3.5 h-3.5" /> },
                    ]
                  ).map((d) => (
                    <button
                      key={d.type}
                      type="button"
                      onClick={() => setFriendDeviceType(d.type)}
                      className={`p-2 rounded-lg border flex items-center gap-2 font-medium transition-all ${
                        friendDeviceType === d.type
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {d.icon}
                      <span>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Friend's MAC Address (Auto-assigned if empty)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A4:83:E7:22:90:11"
                  value={friendCustomMac}
                  onChange={(e) => setFriendCustomMac(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFriendModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={friendAdding}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1.5"
                >
                  {friendAdding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Authorize Friend Device</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
