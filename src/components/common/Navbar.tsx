import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Building2,
  Store,
  ShoppingCart,
  Layers,
  ChevronDown,
  UserCheck,
  Package,
  Activity,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, mobileMenuOpen, setMobileMenuOpen }) => {
  const {
    portalMode,
    setPortalMode,
    activeTenantId,
    setActiveTenantId,
    activeDistributorId,
    setActiveDistributorId,
    currentTenant,
    currentDistributor,
    tenants,
    distributors,
    cart,
  } = useStore();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [distributorDropdownOpen, setDistributorDropdownOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Mode Indicator */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    PharmXpress
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                    B2B Marketplace
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Regulated Pharmaceutical Distribution Network
                </p>
              </div>
            </div>
          </div>

          {/* Center: Portal Mode Switcher (Manufacturer vs Distributor) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setPortalMode('manufacturer')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                portalMode === 'manufacturer'
                  ? 'bg-white text-sky-700 shadow-sm shadow-slate-200 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Manufacturer Portal</span>
            </button>

            <button
              onClick={() => setPortalMode('distributor')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                portalMode === 'distributor'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-indigo-600" />
              <span>Distributor Portal</span>
            </button>
          </div>

          {/* Right Controls: Role Context Switchers & Cart */}
          <div className="flex items-center gap-3">
            {portalMode === 'manufacturer' ? (
              /* Manufacturer Tenant Switcher */
              <div className="relative">
                <button
                  onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 transition-colors text-left"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${currentTenant.logoColor}`}></div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-500 font-medium block leading-none">
                      Active Manufacturer Tenant
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentTenant.shortName}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {tenantDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Tenant (Multi-Tenancy)
                      </span>
                    </div>
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTenantId(t.id);
                          setTenantDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          t.id === activeTenantId ? 'bg-sky-50/60 font-semibold text-sky-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${t.logoColor}`}></div>
                          <div>
                            <span className="block font-medium">{t.name}</span>
                            <span className="text-[10px] text-slate-400">{t.drugLicenseNumber}</span>
                          </div>
                        </div>
                        {t.id === activeTenantId && (
                          <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Distributor Persona Switcher + Cart */
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setDistributorDropdownOpen(!distributorDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-left"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-500 font-medium block leading-none">
                        Distributor Account
                      </span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {currentDistributor.name.split(' ')[0]}...
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {distributorDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-3 py-1.5 border-b border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Distributor Persona
                        </span>
                      </div>
                      {distributors.map((d) => {
                        const isAuthorizedWithAcme = d.authorizedTenants['mfg-acme']?.status === 'approved';
                        const isAuthorizedWithVitalis = d.authorizedTenants['mfg-vitalis']?.status === 'approved';

                        return (
                          <button
                            key={d.id}
                            onClick={() => {
                              setActiveDistributorId(d.id);
                              setDistributorDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                              d.id === activeDistributorId
                                ? 'bg-indigo-50/60 font-semibold text-indigo-900'
                                : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold block">{d.name}</span>
                              {d.id === activeDistributorId && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isAuthorizedWithAcme && (
                                <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 text-[9px] font-medium">
                                  Acme Auth
                                </span>
                              )}
                              {isAuthorizedWithVitalis && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[9px] font-medium">
                                  Vitalis Auth
                                </span>
                              )}
                              {!isAuthorizedWithAcme && !isAuthorizedWithVitalis && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-medium flex items-center gap-0.5">
                                  <ShieldAlert className="w-2.5 h-2.5" /> Pending Access
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cart Icon */}
                <button
                  onClick={onOpenCart}
                  className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  title="View Purchase Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
