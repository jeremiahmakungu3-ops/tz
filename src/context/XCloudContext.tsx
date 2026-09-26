import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RouterDevice,
  HotspotPackage,
  Voucher,
  ActiveSession,
  PaymentTransaction,
  Agent,
  Customer,
  SystemAlert,
  ProvisioningSettings,
  PaymentGateway,
  PortalSessionState,
  DynamicQueueRule,
  DailyReport,
  DeviceType,
  ConnectedDevice
} from '../types';
import {
  initialRouters,
  initialPackages,
  initialVouchers,
  initialActiveSessions,
  initialTransactions,
  initialAgents,
  initialCustomers,
  initialAlerts,
  initialDynamicQueues,
  initialReports
} from '../services/mockData';
import { defaultSettings } from '../services/provisioningGenerator';

interface BandwidthPoint {
  time: string;
  rx: number;
  tx: number;
}

export interface PipelineLog {
  id: string;
  timestamp: string;
  stage: 'MikroTik' | 'Hotspot' | 'RADIUS' | 'Billing' | 'Payment Gateway' | 'Customer/Voucher' | 'Automatic Activation';
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface XCloudContextType {
  routers: RouterDevice[];
  addRouter: (r: Omit<RouterDevice, 'id' | 'lastHeartbeat' | 'provisionToken' | 'uptime' | 'cpuLoad' | 'ramUsage' | 'temp' | 'activeSessions' | 'totalBandwidthTodayGb' | 'isSynced'>) => void;
  rebootRouter: (id: string) => void;
  syncRouter: (id: string) => void;
  deleteRouter: (id: string) => void;
  
  packages: HotspotPackage[];
  addPackage: (p: Omit<HotspotPackage, 'id'>) => void;
  updatePackage: (p: HotspotPackage) => void;
  deletePackage: (id: string) => void;
  
  vouchers: Voucher[];
  generateVouchers: (params: {
    packageId: string;
    routerId: string;
    quantity: number;
    batchName: string;
    codeLength: number;
    isNumericOnly: boolean;
  }) => Voucher[];
  invalidateVoucher: (id: string) => void;
  
  activeSessions: ActiveSession[];
  disconnectSession: (sessionId: string) => boolean;
  
  transactions: PaymentTransaction[];
  triggerStkPush: (params: {
    phone: string;
    gateway: PaymentGateway;
    packageId: string;
    routerId: string;
  }) => Promise<{ success: boolean; voucherCode?: string; message: string }>;
  
  agents: Agent[];
  topupAgentWallet: (agentId: string, amountTzs: number) => void;
  sellVoucherByAgent: (agentId: string, packageId: string) => Voucher | null;
  
  customers: Customer[];
  addCustomer: (phone: string, name?: string) => void;
  removeCustomerMac: (customerId: string, mac: string) => void;
  
  alerts: SystemAlert[];
  dismissAlert: (id: string) => void;
  
  settings: ProvisioningSettings;
  updateSettings: (newSettings: ProvisioningSettings) => void;
  
  liveBandwidth: {
    totalRxMbps: number;
    totalTxMbps: number;
    history: BandwidthPoint[];
  };

  // Captive Portal End-User Experience
  portalSession: PortalSessionState;
  switchPortalDevice: (type: DeviceType) => void;
  addFriendDevice: (name: string, type: DeviceType, customMac?: string) => Promise<{ success: boolean; message: string }>;
  removeFriendDevice: (deviceId: string) => void;
  loginPortalWithVoucher: (code: string, pin: string) => Promise<{ success: boolean; message: string }>;
  loginPortalWithMobileMoney: (params: {
    phone: string;
    gateway: PaymentGateway;
    packageId: string;
    routerId: string;
  }) => Promise<{ success: boolean; voucherCode?: string; message: string }>;
  logoutPortal: () => void;

  // MikroTik Dynamic Queues
  dynamicQueues: DynamicQueueRule[];

  // Reports
  reports: DailyReport[];

  // Pipeline Live Trace
  pipelineLogs: PipelineLog[];
  addPipelineLog: (stage: PipelineLog['stage'], message: string, type?: PipelineLog['type']) => void;
}

const XCloudContext = createContext<XCloudContextType | undefined>(undefined);

export const XCloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routers, setRouters] = useState<RouterDevice[]>(() => {
    const saved = localStorage.getItem('xcloud_routers');
    return saved ? JSON.parse(saved) : initialRouters;
  });

  const [packages, setPackages] = useState<HotspotPackage[]>(() => {
    const saved = localStorage.getItem('xcloud_packages');
    return saved ? JSON.parse(saved) : initialPackages;
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('xcloud_vouchers');
    return saved ? JSON.parse(saved) : initialVouchers;
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem('xcloud_sessions');
    return saved ? JSON.parse(saved) : initialActiveSessions;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('xcloud_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('xcloud_agents');
    return saved ? JSON.parse(saved) : initialAgents;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('xcloud_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const saved = localStorage.getItem('xcloud_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [settings, setSettings] = useState<ProvisioningSettings>(() => {
    const saved = localStorage.getItem('xcloud_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [dynamicQueues, setDynamicQueues] = useState<DynamicQueueRule[]>(() => {
    const saved = localStorage.getItem('xcloud_queues');
    return saved ? JSON.parse(saved) : initialDynamicQueues;
  });

  const [reports] = useState<DailyReport[]>(initialReports);

  // Device Profiles for Multi-Device Simulation
  const DEVICE_PROFILES: Record<DeviceType, { type: DeviceType; name: string; mac: string; os: string }> = {
    iphone: { type: 'iphone', name: 'iPhone 16 Pro', mac: '3C:22:FB:90:1A:44', os: 'iOS 18.2' },
    android: { type: 'android', name: 'Samsung Galaxy S24', mac: '68:DB:CA:11:42:01', os: 'Android 15' },
    tablet: { type: 'tablet', name: 'iPad Air 11"', mac: 'E2:14:88:BB:55:09', os: 'iPadOS 18.1' },
    laptop: { type: 'laptop', name: 'MacBook Pro M3 (Laptop)', mac: 'A4:83:E7:22:90:11', os: 'macOS Sequoia' },
  };

  // Captive Portal Simulator State for simulated devices (iPhone, Android, Tablet, Laptop)
  const [portalSession, setPortalSession] = useState<PortalSessionState>(() => {
    const saved = localStorage.getItem('xcloud_portal_session');
    return saved
      ? JSON.parse(saved)
      : {
          isAuthenticated: false,
          userType: 'none',
          username: '',
          deviceType: 'iphone',
          deviceMac: '3C:22:FB:90:1A:44',
          assignedIp: '192.168.88.204',
          packageName: '',
          rateLimit: '',
          connectedAt: '',
          expiresAt: '',
          timeLeftMinutes: 0,
          bytesUsedMb: 0,
          routerName: 'Kariakoo Market Gateway',
          maxSharedDevices: 2,
          connectedDevices: [],
        };
  });

  // Pipeline Live Logs
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([
    {
      id: 'log-1',
      timestamp: '12:35:10',
      stage: 'MikroTik',
      message: 'MK-DAR-KARIAKOO-01 sent heartbeat: CPU 24%, 184 active hotspot users',
      type: 'info',
    },
    {
      id: 'log-2',
      timestamp: '12:35:42',
      stage: 'RADIUS',
      message: 'Acct-Interim-Update received for user 829104: 1.42 GB consumed, framing IP 192.168.88.241',
      type: 'info',
    },
    {
      id: 'log-3',
      timestamp: '12:36:01',
      stage: 'Payment Gateway',
      message: 'M-Pesa STK Push callback ResultCode: 0 (Receipt: MPESA-QJ8192X01)',
      type: 'success',
    },
    {
      id: 'log-4',
      timestamp: '12:36:02',
      stage: 'Customer/Voucher',
      message: 'Generated voucher 829104, bound MAC 9C:20:7B:44:19:EA to profile 24 Hours Unlimited',
      type: 'success',
    },
    {
      id: 'log-5',
      timestamp: '12:36:03',
      stage: 'Automatic Activation',
      message: 'RADIUS sent Access-Accept + dynamic queue created on MikroTik (10M/5M). User authorized!',
      type: 'success',
    },
  ]);

  const addPipelineLog = (stage: PipelineLog['stage'], message: string, type: PipelineLog['type'] = 'info') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setPipelineLogs((prev) => [
      { id: `log-${Date.now()}`, timestamp: timeStr, stage, message, type },
      ...prev.slice(0, 49),
    ]);
  };

  // Live Bandwidth Telemetry
  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthPoint[]>([
    { time: '12:31', rx: 38.4, tx: 7.2 },
    { time: '12:32', rx: 42.1, tx: 8.5 },
    { time: '12:33', rx: 49.8, tx: 9.1 },
    { time: '12:34', rx: 46.2, tx: 8.9 },
    { time: '12:35', rx: 53.0, tx: 10.4 },
    { time: '12:36', rx: 58.6, tx: 11.2 },
  ]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('xcloud_routers', JSON.stringify(routers));
  }, [routers]);

  useEffect(() => {
    localStorage.setItem('xcloud_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('xcloud_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('xcloud_sessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem('xcloud_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('xcloud_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('xcloud_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('xcloud_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('xcloud_portal_session', JSON.stringify(portalSession));
  }, [portalSession]);

  useEffect(() => {
    localStorage.setItem('xcloud_queues', JSON.stringify(dynamicQueues));
  }, [dynamicQueues]);

  // Telemetry Simulation & Automatic Expiry Engine
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Automatic Expiry Checking
      setActiveSessions((prevSessions) => {
        const remaining: ActiveSession[] = [];
        prevSessions.forEach((s) => {
          // Decrement time left by 1 min every interval cycle
          const newTimeLeft = s.timeLeftMinutes - 1;
          if (newTimeLeft <= 0) {
            // AUTOMATIC EXPIRY: Fire RADIUS Disconnect-Request PoD
            addPipelineLog(
              'RADIUS',
              `RFC 3576 Disconnect-Request sent for expired session ${s.username} (${s.macAddress})`,
              'warning'
            );
            addPipelineLog(
              'Automatic Activation',
              `MikroTik dynamic queue removed for ${s.ipAddress}. Internet access terminated.`,
              'info'
            );

            // Invalidate voucher
            setVouchers((vList) =>
              vList.map((v) => (v.code === s.username ? { ...v, status: 'expired' } : v))
            );

            // Remove queue
            setDynamicQueues((qList) => qList.filter((q) => q.targetIp !== s.ipAddress));

            // If this was captive portal session, expire it
            setPortalSession((cur) => {
              if (cur.username === s.username) {
                return {
                  ...cur,
                  isAuthenticated: false,
                  userType: 'none',
                  timeLeftMinutes: 0,
                };
              }
              return cur;
            });
          } else {
            // Data consumption accumulation
            const rxDelta = Math.random() * 0.4;
            const txDelta = Math.random() * 0.08;
            remaining.push({
              ...s,
              timeLeftMinutes: newTimeLeft,
              bytesInMb: parseFloat((s.bytesInMb + rxDelta).toFixed(1)),
              bytesOutMb: parseFloat((s.bytesOutMb + txDelta).toFixed(1)),
              currentRxMbps: parseFloat((2 + Math.random() * 4).toFixed(1)),
              currentTxMbps: parseFloat((0.2 + Math.random() * 0.8).toFixed(1)),
            });
          }
        });
        return remaining;
      });

      // 2. Portal Session Telemetry if active
      setPortalSession((prev) => {
        if (!prev.isAuthenticated) return prev;
        const delta = Math.random() * 0.3;
        const newTime = Math.max(0, prev.timeLeftMinutes - 1);
        return {
          ...prev,
          timeLeftMinutes: newTime,
          bytesUsedMb: parseFloat((prev.bytesUsedMb + delta).toFixed(1)),
        };
      });

      // 3. Router CPU jitter
      setRouters((prev) =>
        prev.map((r) => {
          if (r.status === 'offline') return r;
          const jitter = (Math.random() - 0.5) * 4;
          const newCpu = Math.min(99, Math.max(8, Math.round(r.cpuLoad + jitter)));
          return {
            ...r,
            cpuLoad: newCpu,
            lastHeartbeat: 'Just now',
          };
        })
      );

      // 4. Bandwidth chart point
      setBandwidthHistory((prev) => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const totalRx = parseFloat((45 + Math.random() * 20).toFixed(1));
        const totalTx = parseFloat((8 + Math.random() * 5).toFixed(1));
        return [...prev.slice(-15), { time: timeStr, rx: totalRx, tx: totalTx }];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Router Actions
  const addRouter = (data: Omit<RouterDevice, 'id' | 'lastHeartbeat' | 'provisionToken' | 'uptime' | 'cpuLoad' | 'ramUsage' | 'temp' | 'activeSessions' | 'totalBandwidthTodayGb' | 'isSynced'>) => {
    const token = `xcl_tok_${data.identity.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 8)}`;
    const newRouter: RouterDevice = {
      ...data,
      id: `rtr-${Date.now().toString().slice(-4)}`,
      uptime: '0m',
      cpuLoad: 12,
      ramUsage: 25,
      temp: 36,
      activeSessions: 0,
      totalBandwidthTodayGb: 0,
      lastHeartbeat: 'Pending install',
      provisionToken: token,
      isSynced: true,
    };
    setRouters((prev) => [newRouter, ...prev]);
    addPipelineLog('MikroTik', `Provisioned new router ${data.identity} with token ${token}`, 'info');
  };

  const rebootRouter = (id: string) => {
    setRouters((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          addPipelineLog('MikroTik', `Reboot command sent to ${r.identity} via WireGuard tunnel`, 'warning');
          return {
            ...r,
            status: 'warning',
            uptime: '0m (Rebooting)',
            activeSessions: 0,
            cpuLoad: 8,
          };
        }
        return r;
      })
    );

    setTimeout(() => {
      setRouters((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            addPipelineLog('MikroTik', `Router ${r.identity} rebooted successfully and reported heartbeat`, 'success');
            return {
              ...r,
              status: 'online',
              uptime: '2m',
              cpuLoad: 16,
            };
          }
          return r;
        })
      );
    }, 4000);
  };

  const syncRouter = (id: string) => {
    setRouters((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSynced: true, status: 'online' } : r))
    );
    addPipelineLog('RADIUS', `Pushed synced FreeRADIUS profiles and Walled Garden to router`, 'info');
  };

  const deleteRouter = (id: string) => {
    setRouters((prev) => prev.filter((r) => r.id !== id));
  };

  // Package Actions
  const addPackage = (p: Omit<HotspotPackage, 'id'>) => {
    const newPkg: HotspotPackage = {
      ...p,
      id: `pkg-${Date.now().toString().slice(-4)}`,
      activeVouchersCount: 0,
    };
    setPackages((prev) => [...prev, newPkg]);
    addPipelineLog('Billing', `Created package ${p.name} with speed limits ${p.rateLimitRx}/${p.rateLimitTx}`, 'info');
  };

  const updatePackage = (updated: HotspotPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // Voucher Generation Engine
  const generateVouchers = ({
    packageId,
    routerId,
    quantity,
    batchName,
    codeLength,
    isNumericOnly,
  }: {
    packageId: string;
    routerId: string;
    quantity: number;
    batchName: string;
    codeLength: number;
    isNumericOnly: boolean;
  }) => {
    const pkg = packages.find((p) => p.id === packageId);
    const router = routers.find((r) => r.id === routerId);
    if (!pkg) return [];

    const batchId = `BATCH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const generated: Voucher[] = [];
    const chars = isNumericOnly ? '0123456789' : '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    for (let i = 0; i < quantity; i++) {
      let code = '';
      for (let c = 0; c < codeLength; c++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      let pin = Math.floor(1000 + Math.random() * 9000).toString();

      generated.push({
        id: `vch-${Date.now()}-${i}`,
        code,
        pin,
        packageId: pkg.id,
        packageName: pkg.name,
        routerId: router?.id || 'all',
        routerName: router?.name || 'All Routers',
        priceTzs: pkg.priceTzs,
        priceUsd: pkg.priceUsd,
        durationMinutes: pkg.durationMinutes,
        rateLimit: `${pkg.rateLimitRx}/${pkg.rateLimitTx}`,
        status: 'available',
        batchId,
        batchName: batchName || `Batch ${batchId}`,
        createdAt: new Date().toISOString(),
        bytesInMb: 0,
        bytesOutMb: 0,
      });
    }

    setVouchers((prev) => [...generated, ...prev]);

    setPackages((prev) =>
      prev.map((p) =>
        p.id === packageId
          ? { ...p, activeVouchersCount: (p.activeVouchersCount || 0) + quantity }
          : p
      )
    );

    addPipelineLog(
      'Customer/Voucher',
      `Generated batch ${batchId} (${quantity} vouchers) for ${pkg.name}`,
      'info'
    );

    return generated;
  };

  const invalidateVoucher = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'expired' } : v))
    );
  };

  // Disconnect Active Session via simulated RADIUS CoA PoD
  const disconnectSession = (sessionId: string): boolean => {
    const session = activeSessions.find((s) => s.id === sessionId);
    if (!session) return false;

    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setVouchers((prev) =>
      prev.map((v) => (v.code === session.username ? { ...v, status: 'used' } : v))
    );
    setDynamicQueues((prev) => prev.filter((q) => q.targetIp !== session.ipAddress));

    setRouters((prev) =>
      prev.map((r) =>
        r.id === session.routerId
          ? { ...r, activeSessions: Math.max(0, r.activeSessions - 1) }
          : r
      )
    );

    if (portalSession.username === session.username) {
      setPortalSession((prev) => ({
        ...prev,
        isAuthenticated: false,
        userType: 'none',
      }));
    }

    addPipelineLog(
      'RADIUS',
      `Manual PoD Disconnect sent for session ${session.username} (${session.ipAddress})`,
      'warning'
    );

    return true;
  };

  // Mobile Money STK Push Processing Simulation
  const triggerStkPush = async ({
    phone,
    gateway,
    packageId,
    routerId,
  }: {
    phone: string;
    gateway: PaymentGateway;
    packageId: string;
    routerId: string;
  }): Promise<{ success: boolean; voucherCode?: string; message: string }> => {
    const pkg = packages.find((p) => p.id === packageId);
    const router = routers.find((r) => r.id === routerId) || routers[0];
    if (!pkg) {
      return { success: false, message: 'Invalid package selected' };
    }

    addPipelineLog('Payment Gateway', `Initiating STK Push to ${phone} via ${gateway.toUpperCase()} for ${pkg.priceTzs.toLocaleString()} TZS`, 'info');

    const txId = `tx-${Date.now().toString().slice(-4)}`;
    const gatewayPrefix = gateway.toUpperCase().substring(0, 4);
    const receiptNum = `${gatewayPrefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newTx: PaymentTransaction = {
      id: txId,
      reference: receiptNum,
      msisdn: phone,
      gateway,
      amountTzs: pkg.priceTzs,
      packageId: pkg.id,
      packageName: pkg.name,
      routerId: router.id,
      routerName: router.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Simulate USSD delay
    await new Promise((res) => setTimeout(res, 2000));

    const voucherCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const voucher: Voucher = {
      id: `vch-auto-${Date.now()}`,
      code: voucherCode,
      pin,
      packageId: pkg.id,
      packageName: pkg.name,
      routerId: router.id,
      routerName: router.name,
      priceTzs: pkg.priceTzs,
      priceUsd: pkg.priceUsd,
      durationMinutes: pkg.durationMinutes,
      rateLimit: `${pkg.rateLimitRx}/${pkg.rateLimitTx}`,
      status: 'available',
      batchId: 'BATCH-MOBILE-MONEY-AUTO',
      batchName: `Direct ${gateway.toUpperCase()} Purchase`,
      createdAt: new Date().toISOString(),
      bytesInMb: 0,
      bytesOutMb: 0,
    };

    setVouchers((prev) => [voucher, ...prev]);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'completed',
              voucherCode,
              completedAt: new Date().toISOString(),
              webhookPayload: {
                ResultCode: 0,
                ResultDesc: 'The service request is processed successfully.',
                TransactionId: receiptNum,
                MSISDN: phone,
                Amount: pkg.priceTzs,
                Timestamp: new Date().toISOString(),
                Gateway: gateway,
              },
            }
          : t
      )
    );

    addPipelineLog('Payment Gateway', `Webhook callback confirmed: ${receiptNum} (ResultCode: 0)`, 'success');
    addPipelineLog('Customer/Voucher', `Generated voucher code ${voucherCode} for ${phone}`, 'success');

    // Customer record update
    setCustomers((prev) => {
      const existing = prev.find(
        (c) => c.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '')
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalSpentTzs: c.totalSpentTzs + pkg.priceTzs,
                vouchersPurchased: c.vouchersPurchased + 1,
                lastSeen: 'Just now',
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cst-${Date.now().toString().slice(-4)}`,
          phone,
          macAddresses: [],
          totalSpentTzs: pkg.priceTzs,
          vouchersPurchased: 1,
          firstSeen: new Date().toISOString().split('T')[0],
          lastSeen: 'Just now',
          status: 'active',
        };
        return [newCust, ...prev];
      }
    });

    return {
      success: true,
      voucherCode,
      message: `Payment confirmed via ${gateway.toUpperCase()}. Voucher ${voucherCode} created!`,
    };
  };

  // Full End-to-End Automatic Activation from the Captive Portal
  const loginPortalWithMobileMoney = async ({
    phone,
    gateway,
    packageId,
    routerId,
  }: {
    phone: string;
    gateway: PaymentGateway;
    packageId: string;
    routerId: string;
  }): Promise<{ success: boolean; voucherCode?: string; message: string }> => {
    addPipelineLog('Hotspot', `Captive Portal: Client device ${portalSession.deviceMac} initiated purchase for ${phone}`, 'info');

    // 1. Process payment
    const paymentRes = await triggerStkPush({ phone, gateway, packageId, routerId });
    if (!paymentRes.success || !paymentRes.voucherCode) {
      return paymentRes;
    }

    const pkg = packages.find((p) => p.id === packageId) || packages[0];
    const router = routers.find((r) => r.id === routerId) || routers[0];
    const voucherCode = paymentRes.voucherCode;

    // 2. AUTOMATIC ACTIVATION: Bind MAC & Authenticate on FreeRADIUS & MikroTik
    addPipelineLog('RADIUS', `FreeRADIUS received Access-Request for ${voucherCode} (MAC: ${portalSession.deviceMac})`, 'info');

    // Create active session in RADIUS stream
    const newSession: ActiveSession = {
      id: `ses-${Date.now()}`,
      username: voucherCode,
      macAddress: portalSession.deviceMac,
      ipAddress: portalSession.assignedIp,
      routerId: router.id,
      routerName: router.name,
      packageName: pkg.name,
      startedAt: 'Just now',
      durationMinutes: pkg.durationMinutes,
      timeLeftMinutes: pkg.durationMinutes,
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      currentRxMbps: 3.5,
      currentTxMbps: 0.8,
    };

    setActiveSessions((prev) => [newSession, ...prev]);

    // Update voucher to active
    setVouchers((prev) =>
      prev.map((v) =>
        v.code === voucherCode
          ? {
              ...v,
              status: 'active',
              activatedAt: new Date().toISOString(),
              macAddress: portalSession.deviceMac,
            }
          : v
      )
    );

    // Create dynamic MikroTik queue
    const newQueue: DynamicQueueRule = {
      id: `queue-${Date.now()}`,
      name: `hs-${voucherCode}`,
      targetIp: portalSession.assignedIp,
      rateLimit: `${pkg.rateLimitRx}/${pkg.rateLimitTx}`,
      burstLimit: `${parseInt(pkg.rateLimitRx) * 1.5}M/${parseInt(pkg.rateLimitTx) * 1.5}M`,
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      packetsDropped: 0,
      status: 'active',
    };
    setDynamicQueues((prev) => [newQueue, ...prev]);

    // Update customer's registered MAC addresses
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '')) {
          const macs = c.macAddresses.includes(portalSession.deviceMac)
            ? c.macAddresses
            : [portalSession.deviceMac, ...c.macAddresses];
          return { ...c, macAddresses: macs };
        }
        return c;
      })
    );

    const currentDevice: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name: DEVICE_PROFILES[portalSession.deviceType]?.name || 'iPhone 16 Pro',
      type: portalSession.deviceType,
      mac: portalSession.deviceMac,
      ip: portalSession.assignedIp,
      os: DEVICE_PROFILES[portalSession.deviceType]?.os || 'iOS 18.2',
      isCurrentDevice: true,
      connectedAt: 'Just now',
    };

    // Set portal session to active!
    setPortalSession((prev) => ({
      ...prev,
      isAuthenticated: true,
      userType: 'mobile_money',
      username: phone,
      packageName: pkg.name,
      rateLimit: `${pkg.rateLimitRx}/${pkg.rateLimitTx}`,
      connectedAt: new Date().toLocaleTimeString(),
      expiresAt: new Date(Date.now() + pkg.durationMinutes * 60000).toLocaleTimeString(),
      timeLeftMinutes: pkg.durationMinutes,
      bytesUsedMb: 0.1,
      quotaMb: pkg.dataLimitMb,
      routerName: router.name,
      maxSharedDevices: pkg.sharedUsers || 2,
      connectedDevices: [currentDevice],
    }));

    addPipelineLog(
      'Automatic Activation',
      `SUCCESS: Device ${portalSession.deviceMac} (${portalSession.deviceType.toUpperCase()}) automatically authorized! Hotspot Walled Garden bypassed.`,
      'success'
    );

    return {
      success: true,
      voucherCode,
      message: `Automatic Activation Complete! Device is now connected to high speed Wi-Fi.`,
    };
  };

  // Captive Portal Login with existing Voucher Code
  const loginPortalWithVoucher = async (code: string, pin: string): Promise<{ success: boolean; message: string }> => {
    addPipelineLog('Hotspot', `Captive Portal: User submitted voucher code ${code} from MAC ${portalSession.deviceMac}`, 'info');

    // Simulate 800ms RADIUS handshake
    await new Promise((res) => setTimeout(res, 800));

    const v = vouchers.find((item) => item.code.trim() === code.trim());
    if (!v) {
      addPipelineLog('RADIUS', `Access-Reject: Invalid voucher code ${code}`, 'warning');
      return { success: false, message: 'Invalid voucher code. Please check your ticket.' };
    }

    if (v.status === 'used' || v.status === 'expired') {
      addPipelineLog('RADIUS', `Access-Reject: Voucher ${code} has already been consumed or expired`, 'warning');
      return { success: false, message: 'This voucher has already been used or expired.' };
    }

    if (v.pin && pin && v.pin !== pin) {
      addPipelineLog('RADIUS', `Access-Reject: Invalid PIN for voucher ${code}`, 'warning');
      return { success: false, message: 'Incorrect PIN for this voucher.' };
    }

    // Success: activate voucher
    setVouchers((prev) =>
      prev.map((item) =>
        item.id === v.id
          ? {
              ...item,
              status: 'active',
              activatedAt: new Date().toISOString(),
              macAddress: portalSession.deviceMac,
            }
          : item
      )
    );

    // Create session
    const newSession: ActiveSession = {
      id: `ses-${Date.now()}`,
      username: v.code,
      macAddress: portalSession.deviceMac,
      ipAddress: portalSession.assignedIp,
      routerId: v.routerId !== 'all' ? v.routerId : routers[0].id,
      routerName: v.routerName !== 'All Routers' ? v.routerName : routers[0].name,
      packageName: v.packageName,
      startedAt: 'Just now',
      durationMinutes: v.durationMinutes,
      timeLeftMinutes: v.durationMinutes,
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      currentRxMbps: 4.2,
      currentTxMbps: 0.9,
    };
    setActiveSessions((prev) => [newSession, ...prev]);

    // Create dynamic queue
    const newQueue: DynamicQueueRule = {
      id: `queue-${Date.now()}`,
      name: `hs-${v.code}`,
      targetIp: portalSession.assignedIp,
      rateLimit: v.rateLimit,
      burstLimit: '15M/8M',
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      packetsDropped: 0,
      status: 'active',
    };
    setDynamicQueues((prev) => [newQueue, ...prev]);

    const currentDevice: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name: DEVICE_PROFILES[portalSession.deviceType]?.name || 'Primary Device',
      type: portalSession.deviceType,
      mac: portalSession.deviceMac,
      ip: portalSession.assignedIp,
      os: DEVICE_PROFILES[portalSession.deviceType]?.os || 'OS',
      isCurrentDevice: true,
      connectedAt: 'Just now',
    };

    const pkgMatched = packages.find((p) => p.name === v.packageName);

    setPortalSession((prev) => ({
      ...prev,
      isAuthenticated: true,
      userType: 'voucher',
      username: v.code,
      packageName: v.packageName,
      rateLimit: v.rateLimit,
      connectedAt: new Date().toLocaleTimeString(),
      expiresAt: new Date(Date.now() + v.durationMinutes * 60000).toLocaleTimeString(),
      timeLeftMinutes: v.durationMinutes,
      bytesUsedMb: 0.1,
      routerName: v.routerName,
      maxSharedDevices: pkgMatched?.sharedUsers || 2,
      connectedDevices: [currentDevice],
    }));

    addPipelineLog(
      'Automatic Activation',
      `Access-Accept: Voucher ${code} authorized for ${portalSession.deviceType.toUpperCase()}. MAC cookie saved.`,
      'success'
    );

    return { success: true, message: `Connected! Welcome to ${v.packageName}.` };
  };

  const switchPortalDevice = (type: DeviceType) => {
    const profile = DEVICE_PROFILES[type];
    setPortalSession((prev) => ({
      ...prev,
      deviceType: type,
      deviceMac: profile.mac,
    }));
    addPipelineLog(
      'Hotspot',
      `Device environment switched to ${profile.name} (${type.toUpperCase()} - MAC: ${profile.mac}, OS: ${profile.os})`,
      'info'
    );
  };

  const addFriendDevice = async (
    name: string,
    type: DeviceType,
    customMac?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (portalSession.connectedDevices.length >= portalSession.maxSharedDevices) {
      return {
        success: false,
        message: `Sharing limit reached (${portalSession.connectedDevices.length}/${portalSession.maxSharedDevices} devices). Upgrade package to share with more friends.`,
      };
    }

    const profile = DEVICE_PROFILES[type];
    const mac =
      customMac ||
      `50:ED:3C:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}`;
    const ip = `192.168.88.${210 + portalSession.connectedDevices.length}`;

    const newDevice: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name,
      type,
      mac,
      ip,
      os: profile.os,
      isCurrentDevice: false,
      connectedAt: 'Just now',
    };

    // Create session in RADIUS stream
    const newSession: ActiveSession = {
      id: `ses-${Date.now()}`,
      username: `${portalSession.username}_${type}`,
      macAddress: mac,
      ipAddress: ip,
      routerId: routers[0]?.id || 'rtr-01',
      routerName: portalSession.routerName,
      packageName: `${portalSession.packageName} (Friend Device)`,
      startedAt: 'Just now',
      durationMinutes: portalSession.timeLeftMinutes,
      timeLeftMinutes: portalSession.timeLeftMinutes,
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      currentRxMbps: 3.4,
      currentTxMbps: 0.5,
    };
    setActiveSessions((prev) => [newSession, ...prev]);

    // Create dynamic queue on MikroTik
    const newQueue: DynamicQueueRule = {
      id: `queue-${Date.now()}`,
      name: `hs-${type}-${mac.slice(-5)}`,
      targetIp: ip,
      rateLimit: portalSession.rateLimit,
      burstLimit: '15M/8M',
      bytesInMb: 0.1,
      bytesOutMb: 0.05,
      packetsDropped: 0,
      status: 'active',
    };
    setDynamicQueues((prev) => [newQueue, ...prev]);

    setPortalSession((prev) => ({
      ...prev,
      connectedDevices: [...prev.connectedDevices, newDevice],
    }));

    addPipelineLog(
      'Automatic Activation',
      `Friend device authorized: ${name} (${type.toUpperCase()}, MAC: ${mac}, IP: ${ip}). Dynamic queue enforced.`,
      'success'
    );

    return {
      success: true,
      message: `Friend's ${type} (${name}) has been connected and granted internet access!`,
    };
  };

  const removeFriendDevice = (deviceId: string) => {
    const target = portalSession.connectedDevices.find((d) => d.id === deviceId);
    if (!target) return;

    setPortalSession((prev) => ({
      ...prev,
      connectedDevices: prev.connectedDevices.filter((d) => d.id !== deviceId),
    }));

    setActiveSessions((prev) => prev.filter((s) => s.macAddress !== target.mac));
    setDynamicQueues((prev) => prev.filter((q) => q.targetIp !== target.ip));

    addPipelineLog(
      'RADIUS',
      `RFC 3576 PoD Disconnect issued for friend device ${target.name} (${target.mac}). Shared slot freed.`,
      'warning'
    );
  };

  const logoutPortal = () => {
    addPipelineLog('Hotspot', `User logged out from captive portal. MAC ${portalSession.deviceMac} unauthenticated.`, 'info');
    setPortalSession((prev) => ({
      ...prev,
      isAuthenticated: false,
      userType: 'none',
      timeLeftMinutes: 0,
    }));
  };

  // Agent Actions
  const topupAgentWallet = (agentId: string, amountTzs: number) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, balanceTzs: a.balanceTzs + amountTzs } : a))
    );
    addPipelineLog('Billing', `Credited agent ${agentId} wallet with ${amountTzs.toLocaleString()} TZS`, 'info');
  };

  const sellVoucherByAgent = (agentId: string, packageId: string): Voucher | null => {
    const agent = agents.find((a) => a.id === agentId);
    const pkg = packages.find((p) => p.id === packageId);
    if (!agent || !pkg) return null;

    const wholesaleCost = pkg.priceTzs * (1 - agent.commissionRate / 100);
    if (agent.balanceTzs < wholesaleCost) {
      alert(`Insufficient float balance! Needed: ${wholesaleCost.toLocaleString()} TZS`);
      return null;
    }

    const commission = pkg.priceTzs - wholesaleCost;
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              balanceTzs: a.balanceTzs - wholesaleCost,
              vouchersSold: a.vouchersSold + 1,
              totalCommissionTzs: a.totalCommissionTzs + commission,
            }
          : a
      )
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const vch: Voucher = {
      id: `vch-agt-${Date.now()}`,
      code,
      pin,
      packageId: pkg.id,
      packageName: pkg.name,
      routerId: routers[0]?.id || 'all',
      routerName: routers[0]?.name || 'All Routers',
      priceTzs: pkg.priceTzs,
      priceUsd: pkg.priceUsd,
      durationMinutes: pkg.durationMinutes,
      rateLimit: `${pkg.rateLimitRx}/${pkg.rateLimitTx}`,
      status: 'available',
      batchId: `AGENT-${agent.id}`,
      batchName: `POS Sale - ${agent.name}`,
      createdAt: new Date().toISOString(),
      bytesInMb: 0,
      bytesOutMb: 0,
      agentId: agent.id,
      agentName: agent.name,
    };

    setVouchers((prev) => [vch, ...prev]);
    addPipelineLog('Billing', `Agent ${agent.name} sold ${pkg.name} via POS (Commission: ${commission.toLocaleString()} TZS)`, 'success');
    return vch;
  };

  // Customer Management
  const addCustomer = (phone: string, name?: string) => {
    const newCust: Customer = {
      id: `cst-${Date.now().toString().slice(-4)}`,
      phone,
      name: name || 'New Customer',
      macAddresses: [],
      totalSpentTzs: 0,
      vouchersPurchased: 0,
      firstSeen: new Date().toISOString().split('T')[0],
      lastSeen: 'Just now',
      status: 'active',
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const removeCustomerMac = (customerId: string, mac: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, macAddresses: c.macAddresses.filter((m) => m !== mac) }
          : c
      )
    );
    addPipelineLog('RADIUS', `Removed device MAC binding ${mac} for customer ${customerId}`, 'info');
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const updateSettings = (newSettings: ProvisioningSettings) => {
    setSettings(newSettings);
    addPipelineLog('MikroTik', `Updated global provisioning parameters (RADIUS server ${newSettings.radiusServerIp})`, 'info');
  };

  const totalRxMbps = activeSessions.reduce((acc, s) => acc + s.currentRxMbps, 0);
  const totalTxMbps = activeSessions.reduce((acc, s) => acc + s.currentTxMbps, 0);

  return (
    <XCloudContext.Provider
      value={{
        routers,
        addRouter,
        rebootRouter,
        syncRouter,
        deleteRouter,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        vouchers,
        generateVouchers,
        invalidateVoucher,
        activeSessions,
        disconnectSession,
        transactions,
        triggerStkPush,
        agents,
        topupAgentWallet,
        sellVoucherByAgent,
        customers,
        addCustomer,
        removeCustomerMac,
        alerts,
        dismissAlert,
        settings,
        updateSettings,
        liveBandwidth: {
          totalRxMbps: parseFloat(totalRxMbps.toFixed(1)),
          totalTxMbps: parseFloat(totalTxMbps.toFixed(1)),
          history: bandwidthHistory,
        },
        portalSession,
        switchPortalDevice,
        addFriendDevice,
        removeFriendDevice,
        loginPortalWithVoucher,
        loginPortalWithMobileMoney,
        logoutPortal,
        dynamicQueues,
        reports,
        pipelineLogs,
        addPipelineLog,
      }}
    >
      {children}
    </XCloudContext.Provider>
  );
};

export const useXCloud = () => {
  const context = useContext(XCloudContext);
  if (!context) {
    throw new Error('useXCloud must be used within an XCloudProvider');
  }
  return context;
};
