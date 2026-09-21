import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Store,
  ShoppingCart,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  User,
  LogOut,
  KeyRound,
  Clock,
  RefreshCw,
  Sparkles,
  Search,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { DispatchClockStrip } from './DispatchClockStrip';

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
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useStore();

  const {
    currentUser,
    isAuthenticated,
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalMode('distributor');
    const el = document.getElementById('marketplace-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Dispatch Clock Utility Strip */}
      <DispatchClockStrip />

      {/* 2. Main Retail-Style White Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white text-[#1A1A1A] border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Left: Brand & Mobile Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                className="cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <BrandLogo variant="light" />
              </div>
            </div>

            {/* Center: Prominent Retail Search Bar (Apollo / PharmEasy Style) */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-3">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search medicines, molecules (e.g. Paracetamol), manufacturers..."
                  className="w-full pl-10 pr-20 py-2 rounded-full border border-gray-200 bg-[#F5F8F6] text-xs sm:text-sm text-[#1A1A1A] placeholder-[#6B7280] focus:bg-white focus:outline-none focus:border-[#1A504C] focus:ring-2 focus:ring-[#1A504C]/15 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-bold rounded-full transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Role Switcher: Segmented Rounded Pill Switcher */}
            <div className="hidden lg:flex items-center p-1 bg-[#F5F8F6] rounded-full border border-gray-200 text-xs shrink-0">
              <button
                onClick={() => setPortalMode('manufacturer')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  portalMode === 'manufacturer'
                    ? 'bg-[#1A504C] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Manufacturer</span>
              </button>

              <button
                onClick={() => setPortalMode('distributor')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  portalMode === 'distributor'
                    ? 'bg-[#1A504C] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Distributor</span>
              </button>
            </div>

            {/* Right Utilities: Account Context, Cart & Test Lab */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {portalMode === 'manufacturer' ? (
                /* Manufacturer Principal Context */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(!tenantDropdownOpen);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A504C] transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${currentTenant.logoColor}`} />
                    <div>
                      <span className="text-[9px] text-[#6B7280] block font-bold leading-none uppercase">
                        Principal
                      </span>
                      <span className="text-xs font-bold text-[#1A1A1A] leading-tight">
                        {currentTenant.shortName}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {tenantDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                      <div className="px-3 py-1.5 border-b border-gray-100">
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                          Switch licensed principal
                        </span>
                      </div>
                      {tenants.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveTenantId(t.id);
                            setTenantDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F5F8F6] transition-colors ${
                            t.id === activeTenantId ? 'bg-[#E8F3F1] font-bold text-[#1A504C]' : 'text-[#1A1A1A]'
                          }`}
                        >
                          <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-[10px] text-[#6B7280]">Licence: {t.drugLicenseNumber}</div>
                          </div>
                          {t.id === activeTenantId && (
                            <span className="text-[9px] font-bold text-[#1A504C] bg-white border border-[#1A504C]/30 px-1.5 py-0.5 rounded">
                              active
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Distributor Account Context */
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => {
                        setDistributorDropdownOpen(!distributorDropdownOpen);
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A504C] transition-colors text-left"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#1A504C]" />
                      <div>
                        <span className="text-[9px] text-[#6B7280] block font-bold leading-none uppercase">
                          Buyer
                        </span>
                        <span className="text-xs font-bold text-[#1A1A1A] leading-tight">
                          {currentDistributor.name.split(' ')[0]}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {distributorDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                        <div className="px-3 py-1.5 border-b border-gray-100">
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                            Switch wholesale buyer account
                          </span>
                        </div>
                        {distributors.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setActiveDistributorId(d.id);
                              setDistributorDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-[#F5F8F6] transition-colors ${
                              d.id === activeDistributorId
                                ? 'bg-[#E8F3F1] font-bold text-[#1A504C]'
                                : 'text-[#1A1A1A]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{d.name}</span>
                              {d.id === activeDistributorId && (
                                <span className="text-[9px] font-bold text-[#1A504C] bg-white border border-[#1A504C]/30 px-1.5 py-0.5 rounded">
                                  active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#6B7280] mt-0.5">
                              Form 20B: {d.licenses?.form20B || d.gstin}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Button with Retail-Style Orange Badge */}
                  <button
                    onClick={onOpenCart}
                    className="relative p-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#1A1A1A] transition-colors"
                    title="View current cart"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#1A504C]" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#EA580C] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Quick Test Lab Preset Trigger */}
              {onOpenTestLab && (
                <button
                  onClick={onOpenTestLab}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-[#E8F3F1] text-[#1A504C] hover:bg-[#d6eae6] text-xs font-bold transition-colors"
                  title="Open regulatory test lab & preset scenarios"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Lab [7]</span>
                </button>
              )}

              {/* JWT Identity / Session Menu */}
              <div className="relative">
                {isAuthenticated && currentUser ? (
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setTenantDropdownOpen(false);
                      setDistributorDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A504C] text-[#1A1A1A] transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1A504C] text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-xs font-bold text-[#1A1A1A] block leading-tight truncate max-w-[90px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-[#6B7280] block leading-none">
                        {currentUser.role.split('_')[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="px-4 py-2 rounded-full bg-[#1A504C] hover:bg-[#143F3C] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Sign In
                  </button>
                )}

                {/* Popover Menu */}
                {userMenuOpen && currentUser && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 space-y-3 text-[#1A1A1A]">
                    <div className="p-2.5 rounded-lg bg-[#F5F8F6] border border-gray-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1A504C] text-white font-bold flex items-center justify-center text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-[#1A1A1A] text-xs block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[11px] text-[#6B7280] block truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px]">
                        <span className="text-[#1A504C] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                          {currentUser.role}
                        </span>
                        <span className="text-[#6B7280]">
                          Exp: {minutesLeft}m {secondsLeft % 60}s
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
                          className="w-full px-3 py-2 rounded-lg text-left text-[#1A1A1A] hover:bg-[#F5F8F6] flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-[#1A504C]" />
                            Switch Persona
                          </span>
                          <span className="text-[10px] text-[#6B7280]">JWT</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          refreshAccessToken();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-[#1A1A1A] hover:bg-[#F5F8F6] flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-[#1A504C]" />
                          Silent Refresh Token
                        </span>
                        <span className="text-[10px] text-[#1A504C] font-bold">+15m</span>
                      </button>

                      <button
                        onClick={() => {
                          expireTokenNowForTesting();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-[#EA580C] hover:bg-[#FEE2E2] flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Simulate Token Expiry
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-gray-500 hover:text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-colors border-t border-gray-100 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search medicines, molecules, brands..."
                className="w-full pl-9 pr-16 py-2 rounded-full border border-gray-200 bg-[#F5F8F6] text-xs text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:border-[#1A504C]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1A504C] text-white text-[10px] font-bold rounded-full"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs"
          />

          <div className="relative w-full max-w-xs bg-white text-[#1A1A1A] h-full shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto border-r border-gray-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <BrandLogo size="sm" variant="light" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Portal Picker */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
                  Select Portal
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F8F6] rounded-xl border border-gray-200">
                  <button
                    onClick={() => {
                      setPortalMode('manufacturer');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      portalMode === 'manufacturer' ? 'bg-[#1A504C] text-white' : 'text-[#6B7280]'
                    }`}
                  >
                    Manufacturer
                  </button>

                  <button
                    onClick={() => {
                      setPortalMode('distributor');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      portalMode === 'distributor' ? 'bg-[#1A504C] text-white' : 'text-[#6B7280]'
                    }`}
                  >
                    Distributor
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              {onOpenTestLab && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTestLab();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#1A504C]/30 bg-[#E8F3F1] text-[#1A504C] font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Evaluation Test Lab [7]</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
