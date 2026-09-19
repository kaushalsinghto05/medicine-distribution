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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Brand & Mobile Hamburger Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                className="cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <BrandLogo />
              </div>
            </div>

            {/* Desktop Center: Portal Switcher */}
            <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
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

            {/* Right Controls: Tenant / Distributor Switcher, Cart & User Auth Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {portalMode === 'manufacturer' ? (
                /* Manufacturer Tenant Switcher */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(!tenantDropdownOpen);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 transition-colors text-left"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${currentTenant.logoColor}`}></div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block leading-none">
                        Active Tenant
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
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => {
                        setDistributorDropdownOpen(!distributorDropdownOpen);
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block leading-none">
                          Buyer Account
                        </span>
                        <span className="text-xs font-bold text-slate-800 leading-tight">
                          {currentDistributor.name.split(' ')[0]}
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
                    className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
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

              {/* Interactive Test & Demo Scenarios Lab Trigger */}
              {onOpenTestLab && (
                <button
                  onClick={onOpenTestLab}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 text-violet-800 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Open Interactive Demo Scenarios & Test Presets"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Demo Lab</span>
                  <span className="bg-violet-200 text-violet-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    7
                  </span>
                </button>
              )}

              {/* JWT Active User / Login Button */}
              <div className="relative">
                {isAuthenticated && currentUser ? (
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setTenantDropdownOpen(false);
                      setDistributorDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
                    title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs relative">
                      {currentUser.name.charAt(0)}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isTokenExpired ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-xs font-bold text-slate-800 leading-tight block truncate max-w-[110px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block leading-none uppercase">
                        {currentUser.role.replace('manufacturer_', 'mfg_')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* User Context Dropdown */}
                {userMenuOpen && currentUser && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 text-xs block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <span className="font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          {currentUser.role}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
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
                          className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                            Switch Persona / JWT
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            Select
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          refreshAccessToken();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                          Silent Refresh Token
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">+15 min</span>
                      </button>

                      <button
                        onClick={() => {
                          expireTokenNowForTesting();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        Simulate Token Expiry
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-500 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2 transition-colors border-t border-slate-100 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Portal Mode Picker */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Portal Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => {
                      setPortalMode('manufacturer');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      portalMode === 'manufacturer'
                        ? 'bg-white text-sky-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Mfg Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setPortalMode('distributor');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      portalMode === 'distributor'
                        ? 'bg-white text-indigo-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Distributor</span>
                  </button>
                </div>
              </div>

              {/* Persona / Tenant Scoping */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {portalMode === 'manufacturer' ? 'Manufacturer Tenant' : 'Distributor Buyer'}
                </label>

                {portalMode === 'manufacturer' ? (
                  <div className="space-y-1.5">
                    {tenants.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTenantId(t.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between ${
                          t.id === activeTenantId
                            ? 'border-sky-400 bg-sky-50/70 text-sky-900 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${t.logoColor}`}></div>
                          <span>{t.name}</span>
                        </div>
                        {t.id === activeTenantId && (
                          <span className="text-[9px] bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {distributors.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveDistributorId(d.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between ${
                          d.id === activeDistributorId
                            ? 'border-indigo-400 bg-indigo-50/70 text-indigo-900 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{d.name}</span>
                        {d.id === activeDistributorId && (
                          <span className="text-[9px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Trigger (Mobile) */}
              {portalMode === 'distributor' && onOpenCart && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Open Shopping Cart ({cartItemCount} items)</span>
                </button>
              )}

              {/* Demo Scenarios Lab (Mobile Trigger) */}
              {onOpenTestLab && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTestLab();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 text-violet-800 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-violet-100 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span>Interactive Demo Lab (7 Presets)</span>
                </button>
              )}
            </div>

            {/* Mobile Auth Persona Card */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {currentUser ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900">{currentUser.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Role: {currentUser.role}
                  </span>
                  <div className="mt-2.5 flex items-center gap-2">
                    {onOpenLogin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenLogin();
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px]"
                      >
                        Switch Persona
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                onOpenLogin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In with JWT</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

