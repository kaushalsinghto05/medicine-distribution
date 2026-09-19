import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { TestLabModal } from './components/common/TestLabModal';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { ManufacturerPortal } from './components/manufacturer/ManufacturerPortal';
import { DistributorPortal } from './components/distributor/DistributorPortal';
import { CartDrawer } from './components/distributor/screens/CartDrawer';
import { LoginModal } from './components/auth/LoginModal';
import { JwtDebuggerBar } from './components/auth/JwtDebuggerBar';
import { HeroSection } from './components/landing/HeroSection';
import { FooterSection } from './components/landing/FooterSection';
import { ShieldAlert, ArrowRight, Building2, Store, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { portalMode, setPortalMode, setActiveTenantId } = useStore();
  const { currentUser, switchPredefinedUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [distributorTab, setDistributorTab] = useState<'browse' | 'orders' | 'account' | 'waste'>('browse');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);

  // Route & Action Guarding (RBAC Check)
  // If user has 'distributor' role but is viewing 'manufacturer' portal, render Access Guard
  const isDistributorTryingManufacturer =
    currentUser?.role === 'distributor' && portalMode === 'manufacturer';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Global Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenTestLab={() => setIsTestLabOpen(true)}
      />

      {/* Hero Section: Enterprise B2B Medical Distribution Overview */}
      <HeroSection
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onExploreCatalog={() => {
          setPortalMode('distributor');
          setDistributorTab('browse');
          const element = document.getElementById('marketplace-content');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Main View Portals or RBAC Guard */}
      <div id="marketplace-content" className="flex-1">
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

      {/* Specification Review & Test Lab Modal */}
      <TestLabModal
        isOpen={isTestLabOpen}
        onClose={() => setIsTestLabOpen(false)}
      />

      {/* Floating Demo Scenarios Launcher Pill */}
      <button
        onClick={() => setIsTestLabOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl hover:shadow-2xl border border-slate-700/60 backdrop-blur transition-all duration-200 hover:scale-105 group text-xs font-semibold"
        title="Open Specification Demo Lab & Presets"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span className="text-slate-200 group-hover:text-white">Demo Lab</span>
        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-500/30">
          7 Presets
        </span>
      </button>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* JWT Debugger Bar (Collapsible Bottom Inspector) */}
      <JwtDebuggerBar onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* Rich B2B Compliance & Multi-Tenant Footer */}
      <FooterSection onOpenLogin={() => setIsLoginModalOpen(true)} />
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

