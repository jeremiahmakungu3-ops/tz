import React, { useState } from 'react';
import { XCloudProvider } from './context/XCloudContext';
import { TopNavbar, ActiveTab } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { RoutersView } from './components/RoutersView';
import { CaptivePortalView } from './components/CaptivePortalView';
import { PipelineVisualizerView } from './components/PipelineVisualizerView';
import { VouchersView } from './components/VouchersView';
import { ActiveSessionsView } from './components/ActiveSessionsView';
import { PaymentsView } from './components/PaymentsView';
import { CustomersView } from './components/CustomersView';
import { AgentsView } from './components/AgentsView';
import { ReportsView } from './components/ReportsView';
import { ArchitectureView } from './components/ArchitectureView';
import { SettingsView } from './components/SettingsView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stkPushModalOpen, setStkPushModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Strict 3-zone Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStkPushModal={() => setStkPushModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenStkPushModal={() => setStkPushModalOpen(true)}
            onOpenVoucherModal={() => {
              setActiveTab('vouchers');
              setVoucherModalOpen(true);
            }}
          />
        )}
        {activeTab === 'routers' && <RoutersView />}
        {activeTab === 'portal' && <CaptivePortalView />}
        {activeTab === 'pipeline' && <PipelineVisualizerView />}
        {activeTab === 'vouchers' && <VouchersView initialOpenGenerator={voucherModalOpen} />}
        {activeTab === 'sessions' && <ActiveSessionsView />}
        {activeTab === 'payments' && (
          <PaymentsView
            stkPushModalOpen={stkPushModalOpen}
            setStkPushModalOpen={setStkPushModalOpen}
          />
        )}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'agents' && <AgentsView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global STK Push Modal accessible across views */}
      {activeTab !== 'payments' && stkPushModalOpen && (
        <PaymentsView
          stkPushModalOpen={stkPushModalOpen}
          setStkPushModalOpen={setStkPushModalOpen}
        />
      )}

      {/* Clean footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span>
            XCLOUD Automatic Hotspot & Billing Engine · MikroTik RouterOS v7 & FreeRADIUS AAA
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>M-Pesa · Airtel · Tigo · Selcom</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Touch Auto Activation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <XCloudProvider>
      <AppContent />
    </XCloudProvider>
  );
}
