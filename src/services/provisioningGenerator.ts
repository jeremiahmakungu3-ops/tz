import { RouterDevice, ProvisioningSettings } from '../types';

export const defaultSettings: ProvisioningSettings = {
  serverDomain: 'cloud.xcloud-isp.net',
  wireguardEndpoint: 'vpn.xcloud-isp.net',
  wireguardPort: 51820,
  wireguardServerPublicKey: 'xCL0uDvPnS3rv3rPubK3y77x9aBcDeFgHiJkLmNoPqRs=',
  radiusServerIp: '10.99.0.1',
  radiusSecret: 'xCloud_R4dius_S3cr3t_2026',
  radiusAuthPort: 1812,
  radiusAcctPort: 1813,
  radiusCoaPort: 3799,
  hotspotDnsName: 'wifi.login',
  hotspotIpRange: '192.168.88.0/24',
};

/**
 * Generates an authentic MikroTik RouterOS v7 WireGuard configuration script
 */
export function generateWireguardRsc(router: RouterDevice, settings: ProvisioningSettings = defaultSettings): string {
  return `# ========================================================
# XCLOUD MIKROTIK PROVISIONING: WIREGUARD VPN TUNNEL
# Router: ${router.name} (${router.identity})
# Model: ${router.model}
# Generated: ${new Date().toISOString()}
# ========================================================

/interface wireguard
add name=wg-xcloud listen-port=13231 comment="XCLOUD-Cloud-VPN-Tunnel"

/interface wireguard peers
add interface=wg-xcloud \\
    public-key="${settings.wireguardServerPublicKey}" \\
    endpoint-address="${settings.wireguardEndpoint}" \\
    endpoint-port=${settings.wireguardPort} \\
    allowed-address=10.99.0.0/24 \\
    persistent-keepalive=25s \\
    comment="XCLOUD-Central-NOC-Gateway"

/ip address
add address=${router.wireguardIp}/24 interface=wg-xcloud comment="XCLOUD-VPN-Address"

/ip firewall filter
add chain=input action=accept protocol=udp dst-port=13231 comment="Allow-WireGuard-Handshake"
add chain=input action=accept src-address=10.99.0.0/24 comment="Allow-XCLOUD-NOC-Management"

/tool netwatch
add host=${settings.radiusServerIp} interval=15s timeout=2s comment="Watch-XCLOUD-Tunnel" \\
    up-script=":log info 'XCLOUD VPN tunnel is UP'" \\
    down-script=":log warning 'XCLOUD VPN tunnel is DOWN! Check Internet WAN'"
`;
}

/**
 * Generates FreeRADIUS AAA client configuration for RouterOS
 */
export function generateRadiusRsc(router: RouterDevice, settings: ProvisioningSettings = defaultSettings): string {
  return `# ========================================================
# XCLOUD MIKROTIK PROVISIONING: FREERADIUS AAA & COA
# Router: ${router.name} (${router.identity})
# Radius Server: ${settings.radiusServerIp}
# ========================================================

/radius
add service=hotspot,wireless,login \\
    address=${settings.radiusServerIp} \\
    secret="${settings.radiusSecret}" \\
    authentication-port=${settings.radiusAuthPort} \\
    accounting-port=${settings.radiusAcctPort} \\
    timeout=3s \\
    comment="XCLOUD-Central-FreeRADIUS-Server"

/radius incoming
set accept=yes port=${settings.radiusCoaPort}

/ip hotspot profile
set [ find default=yes ] use-radius=yes radius-accounting=yes radius-interim-update=1m radius-location-name="${router.identity}"

/system logging
add topics=radius,!debug action=memory
add topics=hotspot,!debug action=memory
`;
}

/**
 * Generates Hotspot, Profiles, and Mobile Money Walled Garden rules
 */
export function generateHotspotRsc(router: RouterDevice, settings: ProvisioningSettings = defaultSettings): string {
  return `# ========================================================
# XCLOUD MIKROTIK PROVISIONING: HOTSPOT & WALLED GARDEN
# Router: ${router.name}
# Portal Domain: http://${settings.hotspotDnsName}
# ========================================================

/ip hotspot profile
set [ find default=yes ] \\
    dns-name="${settings.hotspotDnsName}" \\
    hotspot-address=192.168.88.1 \\
    html-directory=hotspot \\
    login-by=http-chap,http-pap,cookie,mac-cookie \\
    mac-cookie-timeout=7d \\
    http-cookie-lifetime=1d \\
    use-radius=yes \\
    radius-accounting=yes \\
    radius-interim-update=1m

/ip hotspot user profile
set [ find default=yes ] \\
    name="xcloud-default" \\
    shared-users=1 \\
    keepalive-timeout=2m \\
    status-autorefresh=1m \\
    transparent-proxy=no

# --------------------------------------------------------
# WALLED GARDEN: Mobile Money Gateways (M-Pesa, Airtel, Tigo, Selcom)
# Customers can access payment portals while unauthenticated
# --------------------------------------------------------
/ip hotspot walled-garden
add dst-host="${settings.serverDomain}" comment="XCLOUD-Captive-Portal-API"
add dst-host="*safaricom.co.ke" comment="M-Pesa Kenya Callback"
add dst-host="*vodacom.co.tz" comment="M-Pesa Tanzania Callback"
add dst-host="*airtel.co.tz" comment="Airtel Money Callback"
add dst-host="*tigo.co.tz" comment="Tigo Pesa Callback"
add dst-host="*selcom.net" comment="Selcom Payment Gateway"
add dst-host="*selcompay.com" comment="Selcom Pay Gateway"
add dst-host="*google.com" comment="Captive Portal Detection Assist"
add dst-host="*gstatic.com" comment="Captive Portal Detection Assist"
add dst-host="*apple.com" comment="Apple CNA Captive Network Assistant"
add dst-host="*connectivitycheck.android.com" comment="Android Captive Check"

/ip hotspot walled-garden ip
add dst-address=10.99.0.1 comment="XCLOUD-Local-RADIUS-Node"
`;
}

/**
 * Generates automated RouterOS telemetry heartbeat script & scheduler
 */
export function generateHeartbeatRsc(router: RouterDevice, settings: ProvisioningSettings = defaultSettings): string {
  return `# ========================================================
# XCLOUD MIKROTIK PROVISIONING: NOC TELEMETRY HEARTBEAT
# Interval: Every 60 seconds
# Token: ${router.provisionToken}
# ========================================================

/system script
add name="xcloud-heartbeat" dont-require-permissions=no policy=ftp,reboot,read,write,policy,test,password,sniff,sensitive,romon source="\\
  :local cpu [/system resource get cpu-load];\\
  :local ramfree [/system resource get free-memory];\\
  :local ramtotal [/system resource get total-memory];\\
  :local uptime [/system resource get uptime];\\
  :local rosversion [/system resource get version];\\
  :local activeUsers [:len [/ip hotspot active find]];\\
  :local postData (\\"{\\\\\\"token\\\\\\":\\\\\\"${router.provisionToken}\\\\\\",\\\\\\"cpu\\\\\\":\\" . \\$cpu . \\",\\\\\\"active_users\\\\\\":\\" . \\$activeUsers . \\",\\\\\\"uptime\\\\\\":\\\\\\"\\" . \\$uptime . \\"\\\\\\",\\\\\\"version\\\\\\":\\\\\\"\\" . \\$rosversion . \\"\\\\\\"}\\");\\
  :do {\\
    /tool fetch url=\\"https://${settings.serverDomain}/api/routers/heartbeat/\\" http-method=post http-header-field=\\"Content-Type: application/json\\" http-data=\\$postData keep-result=no;\\
    :log debug \\"XCLOUD: Heartbeat report sent successfully (CPU: \\$cpu% Users: \\$activeUsers)\\";\\
  } on-error={\\
    :log warning \\"XCLOUD: Heartbeat delivery failed. Network may be unreachable.\\";\\
  };"

/system scheduler
add name="xcloud-heartbeat-timer" interval=60s on-event="xcloud-heartbeat" start-time=startup comment="XCLOUD-Telemetry-Reporter"
`;
}

/**
 * Complete Master Bootstrap Script for MikroTik Terminal
 */
export function generateFullBootstrapRsc(router: RouterDevice, settings: ProvisioningSettings = defaultSettings): string {
  return `# ====================================================================
#              X C L O U D   M I K R O T I K   O S   I N S T A L L E R
#                     Unified Cloud Hotspot & NOC Agent
# ====================================================================
# Target Router   : ${router.name}
# System Identity : ${router.identity}
# Hardware Model  : ${router.model}
# WireGuard IP    : ${router.wireguardIp}
# Provision Token : ${router.provisionToken}
# Timestamp       : ${new Date().toISOString()}
# ====================================================================

/system identity
set name="${router.identity}"

/system clock
set time-zone-name=Africa/Dar_es_Salaam

/system ntp client
set enabled=yes
/system ntp client servers
add address=pool.ntp.org

/ip dns
set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1

${generateWireguardRsc(router, settings)}

${generateRadiusRsc(router, settings)}

${generateHotspotRsc(router, settings)}

${generateHeartbeatRsc(router, settings)}

:log info "=========================================================="
:log info "  XCLOUD PROVISIONING COMPLETED SUCCESSFULLY!            "
:log info "  Router '${router.identity}' is now connected to Cloud NOC"
:log info "=========================================================="
`;
}
