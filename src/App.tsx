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
import { TitlePlateSplash } from './components/common/TitlePlateSplash';
import { MobileStickyCartBar } from './components/distributor/screens/MobileStickyCartBar';
import { MarketplacePage } from './components/distributor/screens/MarketplacePage';
import { PavilionShowcasePage } from './components/landing/pages/PavilionShowcasePage';
import { ColdChainPage } from './components/landing/pages/ColdChainPage';
import { LicensesPage } from './components/landing/pages/LicensesPage';
import { CreditFacilityPage } from './components/landing/pages/CreditFacilityPage';
import { AddMedicineModal } from './components/common/AddMedicineModal';
import { CartPage } from './components/distributor/screens/CartPage';
import { ShieldAlert, ArrowRight, Building2, Store, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    portalMode, 
    setPortalMode, 
    setActiveTenantId,
    activePage,
    navigateToPage,
    isAddMedicineModalOpen,
    setIsAddMedicineModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
  } = useStore();
  const { currentUser, switchPredefinedUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [distributorTab, setDistributorTab] = useState<'browse' | 'orders' | 'account' | 'waste'>('browse');
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);

  // Auto-align role with portalMode so user is never trapped in a 403 Forbidden screen
  React.useEffect(() => {
    if (portalMode === 'manufacturer' && currentUser?.role === 'distributor') {
      switchPredefinedUser('usr-acme-admin-01');
      setActiveTenantId('mfg-acme');
    }
  }, [portalMode, currentUser?.role]);

  return (
    <div className="min-h-screen bg-medical-mesh text-slate-900 flex flex-col font-sans selection:bg-[#1A504C] selection:text-white relative pb-20">
      {/* Title Plate Splash Screen (First Load Once-Per-Session) */}
      <TitlePlateSplash />

      {/* Global Top Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenTestLab={() => setIsTestLabOpen(true)}
      />

      {/* Main Multi-Page Body View */}
      <main id="marketplace-content" className="flex-1">
        {portalMode === 'manufacturer' ? (
          <ManufacturerPortal
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        ) : activePage === 'home' ? (
          <HeroSection
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onExploreCatalog={() => navigateToPage('marketplace')}
          />
        ) : activePage === 'marketplace' ? (
          <MarketplacePage />
        ) : activePage === 'pavilion' ? (
          <PavilionShowcasePage />
        ) : activePage === 'coldchain' ? (
          <ColdChainPage />
        ) : activePage === 'licenses' ? (
          <LicensesPage />
        ) : activePage === 'credit' ? (
          <CreditFacilityPage />
        ) : activePage === 'orders' ? (
          <DistributorPortal
            onOpenCart={() => setIsCartOpen(true)}
            activeTab="orders"
            setActiveTab={(tab) => {
              setDistributorTab(tab);
              if (tab === 'browse') navigateToPage('marketplace');
              else if (tab === 'orders') navigateToPage('orders');
              else if (tab === 'waste') navigateToPage('waste');
            }}
          />
        ) : activePage === 'waste' ? (
          <DistributorPortal
            onOpenCart={() => setIsCartOpen(true)}
            activeTab="waste"
            setActiveTab={(tab) => {
              setDistributorTab(tab);
              if (tab === 'browse') navigateToPage('marketplace');
              else if (tab === 'orders') navigateToPage('orders');
              else if (tab === 'waste') navigateToPage('waste');
            }}
          />
        ) : activePage === 'cart' ? (
          <CartPage />
        ) : (
          <MarketplacePage />
        )}
      </main>

      {/* Cart Drawer for Distributor */}
      <CartDrawer
        isOpen={isCartOpen && portalMode === 'distributor'}
        onClose={() => setIsCartOpen(false)}
        onNavigateToOrders={() => {
          navigateToPage('orders');
          setIsCartOpen(false);
        }}
      />

      {/* Login & Persona Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Add New Medicine & Packaging Picture Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineModalOpen}
        onClose={() => setIsAddMedicineModalOpen(false)}
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

      {/* Floating WhatsApp B2B Helpdesk Pill (Apollo & PharmEasy Pattern) */}
      <a
        href="https://wa.me/919999999999?text=Hello%20PharmXpress%2C%20I%20want%20to%20place%20a%20wholesale%20B2B%20medicine%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-xl hover:shadow-2xl font-black text-xs transition-all duration-200 hover:scale-105 active:scale-95 group border border-white/20"
        title="Chat with B2B Wholesale Pharmacist on WhatsApp"
      >
        <span className="text-base leading-none">💬</span>
        <span className="font-extrabold tracking-wide uppercase">ORDER ON WHATSAPP</span>
      </a>

      {/* Mobile Sticky Cart Summary Bar */}
      <MobileStickyCartBar onOpenCart={() => setIsCartOpen(true)} />

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

