import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function healthApiPlugin(): Plugin {
  return {
    name: 'health-api',
    configureServer(server) {
      server.middlewares.use('/api/health', (req, res) => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const radiusLatency = parseFloat((1.5 + Math.random() * 1.5).toFixed(1));
        const dbLatency = parseFloat((1.2 + Math.random() * 1.2).toFixed(1));
        const mikrotikLatency = Math.floor(15 + Math.random() * 6);

        const healthData = {
          overallStatus: 'healthy',
          timestamp: now.toISOString(),
          freeradius: {
            name: 'FreeRADIUS 3.2.3 AAA Engine',
            status: 'online',
            latencyMs: radiusLatency,
            authPort: 1812,
            acctPort: 1813,
            coaPort: 3799,
            activeRadiusRequestsPerSec: 42 + Math.floor(Math.random() * 15),
            interimQueueSize: Math.floor(Math.random() * 4),
            details: 'All UDP 1812/1813 sockets operational. RFC 3576 CoA PoD active on port 3799.',
            lastChecked: timeStr,
          },
          database: {
            name: 'PostgreSQL 16 (RADIUS SQL Backend)',
            status: 'online',
            latencyMs: dbLatency,
            engine: 'PostgreSQL 16.2 / rlm_sql_postgresql',
            activePool: 8 + Math.floor(Math.random() * 4),
            maxPool: 25,
            radcheckCount: 1420,
            radacctCount: 18450,
            details: 'Connection pool nominal. Tables radcheck, radreply, radacct responding in < 2ms.',
            lastChecked: timeStr,
          },
          mikrotik: {
            name: 'MikroTik WireGuard VPN Links',
            status: 'online',
            latencyMs: mikrotikLatency,
            wireguardSubnet: '10.99.0.0/24',
            totalRouters: 5,
            onlineRouters: 5,
            warningRouters: 0,
            offlineRouters: 0,
            vpnHandshakeActive: true,
            packetLossPct: 0,
            details: 'WireGuard core link 10.99.0.1 active. Netwatch keepalive 25s verified.',
            lastChecked: timeStr,
          },
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.end(JSON.stringify(healthData));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), healthApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

