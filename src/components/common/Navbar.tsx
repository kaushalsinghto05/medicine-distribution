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
  ShieldAlert,
  User,
  LogOut,
  KeyRound,
  Clock,
  RefreshCw,
  Sparkles,
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
      {/* 1. Dispatch Clock Strip (The Single Moment of Boldness) */}
      <DispatchClockStrip />

      {/* 2. Main Pharmacy Ledger Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1F2E28] text-[#F6F3EC] border-b border-[#2C3E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Left: Brand & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#8A8578] hover:text-[#F6F3EC] hover:bg-[#2C3E36] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                className="cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <BrandLogo variant="dark" />
              </div>
            </div>

            {/* Center: Register Workspace Switcher */}
            <div className="hidden md:flex items-center p-1 bg-[#16221E] rounded-lg border border-[#2C3E36] text-xs">
              <button
                onClick={() => setPortalMode('manufacturer')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-sans font-medium transition-all ${
                  portalMode === 'manufacturer'
                    ? 'bg-[#3D6B52] text-[#F6F3EC] shadow-xs'
                    : 'text-[#8A8578] hover:text-[#F6F3EC]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Manufacturer register</span>
              </button>

              <button
                onClick={() => setPortalMode('distributor')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-sans font-medium transition-all ${
                  portalMode === 'distributor'
                    ? 'bg-[#3D6B52] text-[#F6F3EC] shadow-xs'
                    : 'text-[#8A8578] hover:text-[#F6F3EC]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Distributor register</span>
              </button>
            </div>

            {/* Right: Record Accounts, Cart & Inspection Lab */}
            <div className="flex items-center gap-2 sm:gap-3">
              {portalMode === 'manufacturer' ? (
                /* Manufacturer Principal Context */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(!tenantDropdownOpen);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2C3E36] bg-[#16221E] hover:border-[#3D6B52] transition-colors text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${currentTenant.logoColor}`} />
                    <div>
                      <span className="text-[9px] text-[#8A8578] block font-mono leading-none">
                        Active principal
                      </span>
                      <span className="text-xs font-serif font-bold text-[#F6F3EC] leading-tight">
                        {currentTenant.shortName}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8A8578]" />
                  </button>

                  {tenantDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-[#16221E] rounded-lg shadow-xl border border-[#2C3E36] py-1.5 z-50">
                      <div className="px-3 py-1.5 border-b border-[#2C3E36]">
                        <span className="text-[10px] font-mono text-[#8A8578] block">
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#1F2E28] transition-colors ${
                            t.id === activeTenantId ? 'bg-[#1F2E28] font-bold text-[#C9A961]' : 'text-[#F6F3EC]'
                          }`}
                        >
                          <div>
                            <div className="font-serif font-semibold">{t.name}</div>
                            <div className="text-[10px] text-[#8A8578] font-mono">Licence: {t.drugLicenseNumber}</div>
                          </div>
                          {t.id === activeTenantId && (
                            <span className="text-[9px] font-mono border border-[#C9A961]/50 text-[#C9A961] px-1.5 py-0.5 rounded">
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2C3E36] bg-[#16221E] hover:border-[#3D6B52] transition-colors text-left"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#3D6B52]" />
                      <div>
                        <span className="text-[9px] text-[#8A8578] block font-mono leading-none">
                          Buyer licence
                        </span>
                        <span className="text-xs font-serif font-bold text-[#F6F3EC] leading-tight">
                          {currentDistributor.name.split(' ')[0]}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#8A8578]" />
                    </button>

                    {distributorDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-[#16221E] rounded-lg shadow-xl border border-[#2C3E36] py-1.5 z-50">
                        <div className="px-3 py-1.5 border-b border-[#2C3E36]">
                          <span className="text-[10px] font-mono text-[#8A8578] block">
                            Switch wholesale buyer account
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
                              className={`w-full px-3 py-2 text-left text-xs hover:bg-[#1F2E28] transition-colors ${
                                d.id === activeDistributorId
                                  ? 'bg-[#1F2E28] font-bold text-[#C9A961]'
                                  : 'text-[#F6F3EC]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-serif font-semibold">{d.name}</span>
                                {d.id === activeDistributorId && (
                                  <span className="text-[9px] font-mono border border-[#C9A961]/50 text-[#C9A961] px-1.5 py-0.5 rounded">
                                    active
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8A8578] font-mono mt-0.5">
                                Form 20B: {d.licenses?.form20B || d.gstin}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Manifest Cart */}
                  <button
                    onClick={onOpenCart}
                    className="relative p-2 rounded-lg border border-[#2C3E36] bg-[#16221E] hover:border-[#3D6B52] text-[#F6F3EC] transition-colors"
                    title="View current order manifest"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#B54A32] text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Test Lab Trigger */}
              {onOpenTestLab && (
                <button
                  onClick={onOpenTestLab}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#C9A961] hover:bg-[#C9A961]/20 text-xs font-mono transition-colors"
                  title="Open regulatory test lab & preset evaluation scenarios"
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
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#2C3E36] bg-[#16221E] hover:border-[#3D6B52] text-[#F6F3EC] transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded bg-[#3D6B52] text-white font-serif font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-xs font-serif font-bold text-[#F6F3EC] block leading-tight truncate max-w-[90px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-[#8A8578] font-mono block leading-none">
                        {currentUser.role.split('_')[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-[#8A8578]" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLogin}
                    className="px-3 py-1.5 rounded-lg bg-[#3D6B52] hover:bg-[#4E8568] text-white text-xs font-sans font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                )}

                {/* Popover Menu */}
                {userMenuOpen && currentUser && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#16221E] rounded-lg shadow-xl border border-[#2C3E36] p-3 z-50 space-y-3 text-[#F6F3EC]">
                    <div className="p-2.5 rounded bg-[#1F2E28] border border-[#2C3E36]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#3D6B52] text-white font-serif font-bold flex items-center justify-center text-sm">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-serif font-bold text-[#F6F3EC] text-xs block truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[11px] text-[#8A8578] font-mono block truncate">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2C3E36] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#C9A961] border border-[#C9A961]/40 px-1.5 py-0.5 rounded">
                          {currentUser.role}
                        </span>
                        <span className="text-[#8A8578]">
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
                          className="w-full px-3 py-2 rounded text-left text-[#F6F3EC] hover:bg-[#1F2E28] flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-[#3D6B52]" />
                            Switch persona
                          </span>
                          <span className="text-[10px] font-mono text-[#8A8578]">JWT</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          refreshAccessToken();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded text-left text-[#F6F3EC] hover:bg-[#1F2E28] flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-[#3D6B52]" />
                          Silent refresh token
                        </span>
                        <span className="text-[10px] font-mono text-[#3D6B52]">+15m</span>
                      </button>

                      <button
                        onClick={() => {
                          expireTokenNowForTesting();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded text-left text-[#B54A32] hover:bg-[#1F2E28] flex items-center gap-2 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Simulate token expiry
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded text-left text-[#8A8578] hover:text-[#B54A32] hover:bg-[#1F2E28] flex items-center gap-2 transition-colors border-t border-[#2C3E36] pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#16221E]/80 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-xs bg-[#1F2E28] text-[#F6F3EC] h-full shadow-2xl flex flex-col justify-between p-5 z-10 overflow-y-auto border-r border-[#2C3E36]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2C3E36] pb-4">
                <BrandLogo size="sm" variant="dark" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded text-[#8A8578] hover:text-[#F6F3EC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Portal Picker */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#8A8578] block">
                  Select register mode
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#16221E] rounded-lg border border-[#2C3E36]">
                  <button
                    onClick={() => {
                      setPortalMode('manufacturer');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 rounded text-xs font-semibold ${
                      portalMode === 'manufacturer' ? 'bg-[#3D6B52] text-white' : 'text-[#8A8578]'
                    }`}
                  >
                    Manufacturer
                  </button>

                  <button
                    onClick={() => {
                      setPortalMode('distributor');
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2 rounded text-xs font-semibold ${
                      portalMode === 'distributor' ? 'bg-[#3D6B52] text-white' : 'text-[#8A8578]'
                    }`}
                  >
                    Distributor
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2C3E36] space-y-2">
              {onOpenTestLab && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTestLab();
                  }}
                  className="w-full py-2 rounded border border-[#C9A961]/50 text-[#C9A961] font-mono text-xs flex items-center justify-center gap-1.5"
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
