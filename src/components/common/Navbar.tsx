import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Store,
  ShoppingCart,
  ChevronDown,
  UserCheck,
  Activity,
  Menu,
  X,
  ShieldAlert,
  User,
  LogOut,
  KeyRound,
  Clock,
  RefreshCw,
  Sparkles,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenCart?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenLogin?: () => void;
  onOpenTestLab?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenLogin,
  onOpenTestLab,
}) => {
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

  const {
    currentUser,
    isAuthenticated,
    isTokenExpired,
    logout,
    refreshAccessToken,
    expireTokenNowForTesting,
  } = useAuth();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [distributorDropdownOpen, setDistributorDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Time remaining on access token
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = currentUser?.exp ? Math.max(0, currentUser.exp - now) : 0;
  const minutesLeft = Math.floor(secondsLeft / 60);

  return (
    <>
      {/* Top B2B Regulatory & Chemist Helpline Bar (Clean & Consolidated — No Duplicate Badges) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold text-teal-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>Pan-India B2B Pharma Network</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-teal-400 stroke-[1.75]" />
              <span>Chemist Desk: <strong className="text-white font-mono">1800-266-PHARMA</strong></span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
              <span>Next Dispatch: <strong className="text-amber-300 font-mono">Today 5:30 PM</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="text-slate-400">Licensed Wholesale Procurement</span>
            <span className="text-slate-700">•</span>
            <span className="text-teal-400 font-medium">B2B E-Invoicing</span>
          </div>
        </div>
      </div>

      {/* Main Persistent Dark Enterprise Header Bar (Unified Theme Across All Scroll Positions) */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Brand & Mobile Hamburger Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75]" /> : <Menu className="w-5 h-5 stroke-[1.75]" />}
              </button>

              <div
                className="cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <BrandLogo variant="dark" />
              </div>
            </div>

            {/* Desktop Center: Portal Switcher (Unified h-9 pill container) */}
            <div className="hidden md:flex items-center h-9 p-0.5 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setPortalMode('manufacturer')}
                className={`h-8 flex items-center gap-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
                  portalMode === 'manufacturer'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 stroke-[1.75]" />
                <span>Manufacturer Portal</span>
              </button>

              <button
                onClick={() => setPortalMode('distributor')}
                className={`h-8 flex items-center gap-2 px-3.5 rounded-lg text-xs font-semibold transition-all ${
                  portalMode === 'distributor'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 stroke-[1.75]" />
                <span>Distributor Portal</span>
              </button>
            </div>

            {/* Right Controls: Unified h-9 height, rounded-xl radius, and matching padding */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {portalMode === 'manufacturer' ? (
                /* Manufacturer Tenant Switcher */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(!tenantDropdownOpen);
                      setUserMenuOpen(false);
                    }}
                    className="h-9 flex items-center gap-2 px-3 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors text-left"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${currentTenant.logoColor}`}></div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-medium block leading-none">
                        Active Tenant
                      </span>
                      <span className="text-xs font-bold text-white leading-tight">
                        {currentTenant.shortName}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </button>

                  {tenantDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in">
                      <div className="px-3 py-1.5 border-b border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            t.id === activeTenantId ? 'bg-sky-950/60 font-bold text-sky-300' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${t.logoColor}`}></div>
                            <div>
                              <span className="block font-medium">{t.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{t.drugLicenseNumber}</span>
                            </div>
                          </div>
                          {t.id === activeTenantId && (
                            <span className="text-[10px] bg-sky-900/60 text-sky-300 px-1.5 py-0.5 rounded font-bold border border-sky-700/60">
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
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => {
                        setDistributorDropdownOpen(!distributorDropdownOpen);
                        setUserMenuOpen(false);
                      }}
                      className="h-9 flex items-center gap-2 px-3 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-teal-400 stroke-[1.75]" />
                      <div>
                        <span className="text-[9px] text-slate-400 font-medium block leading-none">
                          Buyer Account
                        </span>
                        <span className="text-xs font-bold text-white leading-tight">
                          {currentDistributor.name.split(' ')[0]}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                    </button>

                    {distributorDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in">
                        <div className="px-3 py-1.5 border-b border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                              className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors ${
                                d.id === activeDistributorId
                                  ? 'bg-teal-950/60 font-bold text-teal-300'
                                  : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold block">{d.name}</span>
                                {d.id === activeDistributorId && (
                                  <span className="text-[10px] bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded font-bold border border-teal-700/60">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {isAuthorizedWithAcme && (
                                  <span className="px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 text-[9px] font-medium border border-sky-800/60">
                                    Acme Auth
                                  </span>
                                )}
                                {isAuthorizedWithVitalis && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 text-[9px] font-medium border border-emerald-800/60">
                                    Vitalis Auth
                                  </span>
                                )}
                                {!isAuthorizedWithAcme && !isAuthorizedWithVitalis && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 text-[9px] font-medium flex items-center gap-0.5 border border-amber-800/60">
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

                  {/* Cart Button (h-9 unified) */}
                  <button
                    onClick={onOpenCart}
                    className="h-9 w-9 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors flex items-center justify-center relative"
                    title="View Purchase Cart"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[1.75]" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Demo Lab Trigger (h-9 unified height and radius) */}
              {onOpenTestLab && (
                <button
                  onClick={onOpenTestLab}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-violet-700/60 bg-gradient-to-r from-violet-950 to-indigo-950 hover:border-violet-500 text-violet-200 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Open Interactive Demo Scenarios & Test Presets"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 stroke-[1.75]" />
                  <span>Demo Lab</span>
                  <span className="bg-violet-800/80 text-violet-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-violet-600/60">
                    7
                  </span>
                </button>
              )}

              {/* JWT Active User / Login Button (h-9 unified) */}
              <div className="relative">
                {isAuthenticated && currentUser ? (
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setTenantDropdownOpen(false);
                      setDistributorDropdownOpen(false);
                    }}
                    className="h-9 flex items-center gap-2 px-2.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors text-left"
                    title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs relative">
                      {currentUser.name.charAt(0)}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                          isTokenExpired ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <span className="text-xs font-bold text-white block leading-tight truncate max-w-[90px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 block leading-none font-mono">
                        {currentUser.role.split('_')[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 stroke-[1.75]" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <User className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>Log In</span>
                  </button>
                )}

                {/* User Popover Menu */}
                {userMenuOpen && currentUser && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-3 z-50 space-y-3 animate-in fade-in text-white">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white text-xs block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="font-mono uppercase font-bold text-teal-300 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-800">
                          {currentUser.role}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400 stroke-[1.75]" />
                          <span>Exp: {minutesLeft}m {secondsLeft % 60}s</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      {onOpenLogin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenLogin();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-sky-400 stroke-[1.75]" />
                            Switch Persona / JWT
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            Select
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          refreshAccessToken();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 stroke-[1.75]" />
                          Silent Refresh Token
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">+15 min</span>
                      </button>

                      <button
                        onClick={() => {
                          expireTokenNowForTesting();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-rose-400 stroke-[1.75]" />
                        Simulate Token Expiry
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 flex items-center gap-2 transition-colors border-t border-slate-800 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer (<1024px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-slate-900 text-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200 overflow-y-auto border-r border-slate-800">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <BrandLogo size="sm" variant="dark" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>

              {/* Portal Mode Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Portal Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setPortalMode('manufacturer');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      portalMode === 'manufacturer'
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4 stroke-[1.75]" />
                    <span>Mfg Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setPortalMode('distributor');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      portalMode === 'distributor'
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-4 h-4 stroke-[1.75]" />
                    <span>Distributor</span>
                  </button>
                </div>
              </div>

              {/* Persona Context */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Context
                </span>
                <div className="text-xs font-semibold text-white">
                  {portalMode === 'manufacturer' ? currentTenant.name : currentDistributor.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {portalMode === 'manufacturer' ? currentTenant.drugLicenseNumber : `DL: ${currentDistributor.licenses?.form20B || currentDistributor.gstin}`}
                </div>
              </div>
            </div>

            {/* Bottom Drawer Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              {onOpenTestLab && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTestLab();
                  }}
                  className="w-full py-2.5 rounded-xl border border-violet-700/60 bg-violet-950/60 text-violet-200 font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-violet-400 stroke-[1.75]" />
                  <span>Interactive Test Lab [7]</span>
                </button>
              )}

              {onOpenLogin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-teal-400 stroke-[1.75]" />
                  <span>Switch Persona / Auth</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
