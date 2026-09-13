import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { TestScenarioBar } from './components/common/TestScenarioBar';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ManufacturerPortal } from './components/manufacturer/ManufacturerPortal';
import { DistributorPortal } from './components/distributor/DistributorPortal';
import { CartDrawer } from './components/distributor/screens/CartDrawer';

const AppContent: React.FC = () => {
  const { portalMode } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [distributorTab, setDistributorTab] = useState<'browse' | 'orders' | 'account'>('browse');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Interactive Test Scenario Presets Bar */}
      <TestScenarioBar />

      {/* Global Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main View Portals */}
      <div className="flex-1">
        {portalMode === 'manufacturer' ? (
          <ManufacturerPortal
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        ) : (
          <DistributorPortal
            onOpenCart={() => setIsCartOpen(true)}
            activeTab={distributorTab}
            setActiveTab={setDistributorTab}
          />
        )}
      </div>

      {/* Cart Drawer for Distributor */}
      <CartDrawer
        isOpen={isCartOpen && portalMode === 'distributor'}
        onClose={() => setIsCartOpen(false)}
        onNavigateToOrders={() => {
          setDistributorTab('orders');
          setIsCartOpen(false);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PharmXpress B2B Platform • Multi-Tenant Pharmaceutical Marketplace</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Schedule H / H1 Regulated</span>
            <span>•</span>
            <span>Form 20B/21B Wholesale Compliance</span>
            <span>•</span>
            <span>ISO 9001:2015 & WHO-GMP Traceability</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
