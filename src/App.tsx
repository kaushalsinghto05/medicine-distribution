import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { TestScenarioBar } from './components/common/TestScenarioBar';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ManufacturerPortal } from './components/manufacturer/ManufacturerPortal';
import { DistributorPortal } from './components/distributor/DistributorPortal';
import { CartDrawer } from './components/distributor/screens/CartDrawer';
import { LoginModal } from './components/auth/LoginModal';
import { JwtDebuggerBar } from './components/auth/JwtDebuggerBar';
import { ShieldAlert, ArrowRight, Building2, Store } from 'lucide-react';

const AppContent: React.FC = () => {
  const { portalMode, setPortalMode, setActiveTenantId } = useStore();
  const { currentUser, switchPredefinedUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [distributorTab, setDistributorTab] = useState<'browse' | 'orders' | 'account' | 'waste'>('browse');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Route & Action Guarding (RBAC Check)
  // If user has 'distributor' role but is viewing 'manufacturer' portal, render Access Guard
  const isDistributorTryingManufacturer =
    currentUser?.role === 'distributor' && portalMode === 'manufacturer';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Interactive Test Scenario Presets Bar */}
      <TestScenarioBar />

      {/* Global Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main View Portals or RBAC Guard */}
      <div className="flex-1">
        {isDistributorTryingManufacturer ? (
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-xl space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                  403 Forbidden • JWT Scope Restriction
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Manufacturer Portal Access Restricted
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your active JWT token is authenticated as wholesale distributor{' '}
                  <strong className="text-slate-900">{currentUser?.name}</strong> (Role:{' '}
                  <code className="text-indigo-600 font-bold">{currentUser?.role}</code>).
                  Manufacturing inventory control, batch creation, and disposal policies are restricted to{' '}
                  <code className="text-purple-700 font-semibold">manufacturer_admin</code> or{' '}
                  <code className="text-cyan-700 font-semibold">manufacturer_staff</code>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    switchPredefinedUser('usr-acme-admin-01');
                    setActiveTenantId('mfg-acme');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Switch to Mfg Admin (Dr. Rajesh Nair)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPortalMode('distributor')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span>Return to Distributor Portal</span>
                </button>
              </div>
            </div>
          </div>
        ) : portalMode === 'manufacturer' ? (
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

      {/* Login & Persona Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* JWT Debugger Bar (Collapsible Bottom Inspector) */}
      <JwtDebuggerBar onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
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
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  );
}

