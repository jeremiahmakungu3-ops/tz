export type RouterStatus = 'online' | 'offline' | 'warning';

export interface RouterDevice {
  id: string;
  name: string;
  identity: string;
  model: string;
  serialNumber: string;
  routerOsVersion: string;
  ipAddress: string;
  wireguardIp: string;
  macAddress: string;
  location: string;
  status: RouterStatus;
  uptime: string;
  cpuLoad: number; // percentage
  ramUsage: number; // percentage
  temp: number; // Celsius
  activeSessions: number;
  totalBandwidthTodayGb: number;
  lastHeartbeat: string;
  provisionToken: string;
  isSynced: boolean;
}

export interface HotspotPackage {
  id: string;
  name: string;
  priceTzs: number;
  priceUsd: number;
  durationMinutes: number;
  rateLimitRx: string; // e.g., "5M"
  rateLimitTx: string; // e.g., "5M"
  dataLimitMb?: number; // optional data quota
  sharedUsers: number;
  description: string;
  color: string;
  activeVouchersCount?: number;
}

export type VoucherStatus = 'available' | 'active' | 'used' | 'expired';

export interface Voucher {
  id: string;
  code: string;
  pin: string;
  packageId: string;
  packageName: string;
  routerId: string;
  routerName: string;
  priceTzs: number;
  priceUsd: number;
  durationMinutes: number;
  rateLimit: string;
  status: VoucherStatus;
  batchId: string;
  batchName: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  macAddress?: string;
  bytesInMb: number;
  bytesOutMb: number;
  agentId?: string;
  agentName?: string;
}

export interface ActiveSession {
  id: string;
  username: string; // Voucher code or customer phone
  macAddress: string;
  ipAddress: string;
  routerId: string;
  routerName: string;
  packageName: string;
  startedAt: string;
  durationMinutes: number;
  timeLeftMinutes: number;
  bytesInMb: number;
  bytesOutMb: number;
  currentRxMbps: number;
  currentTxMbps: number;
}

export type PaymentGateway = 'mpesa' | 'airtel' | 'tigopesa' | 'selcom';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface PaymentTransaction {
  id: string;
  reference: string;
  msisdn: string; // phone number e.g. 255754123456
  gateway: PaymentGateway;
  amountTzs: number;
  packageId: string;
  packageName: string;
  routerId: string;
  routerName: string;
  status: PaymentStatus;
  voucherCode?: string;
  createdAt: string;
  completedAt?: string;
  webhookPayload?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  location: string;
  balanceTzs: number;
  commissionRate: number; // e.g. 12%
  vouchersSold: number;
  totalCommissionTzs: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  macAddresses: string[];
  devices?: ConnectedDevice[];
  totalSpentTzs: number;
  vouchersPurchased: number;
  firstSeen: string;
  lastSeen: string;
  status: 'active' | 'inactive';
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  source: string;
  timestamp: string;
  resolved: boolean;
}

export interface ProvisioningSettings {
  serverDomain: string;
  wireguardEndpoint: string;
  wireguardPort: number;
  wireguardServerPublicKey: string;
  radiusServerIp: string;
  radiusSecret: string;
  radiusAuthPort: number;
  radiusAcctPort: number;
  radiusCoaPort: number;
  hotspotDnsName: string;
  hotspotIpRange: string;
}

export type DeviceType = 'iphone' | 'android' | 'tablet' | 'laptop';

export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceType;
  mac: string;
  ip: string;
  os: string;
  isCurrentDevice?: boolean;
  connectedAt: string;
}

export interface PortalSessionState {
  isAuthenticated: boolean;
  userType: 'voucher' | 'mobile_money' | 'none';
  username: string;
  deviceType: DeviceType;
  deviceMac: string;
  assignedIp: string;
  packageName: string;
  rateLimit: string;
  connectedAt: string;
  expiresAt: string;
  timeLeftMinutes: number;
  bytesUsedMb: number;
  quotaMb?: number;
  routerName: string;
  maxSharedDevices: number;
  connectedDevices: ConnectedDevice[];
}

export interface DynamicQueueRule {
  id: string;
  name: string;
  targetIp: string;
  rateLimit: string;
  burstLimit: string;
  bytesInMb: number;
  bytesOutMb: number;
  packetsDropped: number;
  status: 'active' | 'expired';
}

export interface DailyReport {
  date: string;
  revenueTzs: number;
  revenueUsd: number;
  vouchersGenerated: number;
  vouchersActivated: number;
  activeSessionsPeak: number;
  dataConsumedGb: number;
  gatewayDistribution: {
    mpesa: number;
    airtel: number;
    tigopesa: number;
    selcom: number;
  };
}

export type HealthStatusLevel = 'online' | 'warning' | 'error';

export interface ServiceHealthLink {
  name: string;
  status: HealthStatusLevel;
  latencyMs: number;
  details: string;
  lastChecked: string;
}

export interface SystemHealthData {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  freeradius: ServiceHealthLink & {
    authPort: number;
    acctPort: number;
    coaPort: number;
    activeRadiusRequestsPerSec: number;
    interimQueueSize: number;
  };
  database: ServiceHealthLink & {
    engine: string;
    activePool: number;
    maxPool: number;
    radcheckCount: number;
    radacctCount: number;
  };
  mikrotik: ServiceHealthLink & {
    wireguardSubnet: string;
    totalRouters: number;
    onlineRouters: number;
    warningRouters: number;
    offlineRouters: number;
    vpnHandshakeActive: boolean;
    packetLossPct: number;
  };
}


