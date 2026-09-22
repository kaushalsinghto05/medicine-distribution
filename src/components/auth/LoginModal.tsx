import React, { useState } from 'react';
import { useAuth, PREDEFINED_USERS, PredefinedUser } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  Building2,
  Store,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  UserPlus,
  LogIn,
  Users,
  Sparkles,
  FileCheck,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { PharmaPattern } from '../ui/PharmaPattern';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  forceRequired?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  forceRequired = false,
}) => {
  const { login, signup, isTokenExpired, refreshAccessToken, logout } = useAuth();
  const {
    setPortalMode,
    setActiveTenantId,
    setActiveDistributorId,
    addToast,
    loginPromptMessage,
    setLoginPromptMessage,
    pendingAddToCartItem,
    setPendingAddToCartItem,
    addToCart,
    registerNewDistributor,
    registerNewTenant,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupRole, setSignupRole] = useState<'distributor' | 'manufacturer'>('distributor');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [drugLicenseNumber, setDrugLicenseNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('');

  if (!isOpen) return null;

  const handleSuccessfulAuth = () => {
    if (pendingAddToCartItem) {
      addToCart(pendingAddToCartItem);
      addToast(
        'success',
        'Added to Cart',
        `${pendingAddToCartItem.quantity} ${pendingAddToCartItem.packagingUnit}s of ${pendingAddToCartItem.medicineName} added to your order tray.`
      );
      setPendingAddToCartItem(null);
    }
    setLoginPromptMessage('');
    if (onClose) onClose();
  };

  const handleSelectPredefined = async (user: PredefinedUser) => {
    setLoading(true);
    await login(user);

    if (user.role === 'distributor') {
      setPortalMode('distributor');
      if (user.distributorId) {
        setActiveDistributorId(user.distributorId);
      }
    } else {
      setPortalMode('manufacturer');
      if (user.tenantId) {
        setActiveTenantId(user.tenantId);
      }
    }

    addToast('success', 'JWT Session Authenticated', `Signed in as ${user.name} (${user.role.replace(/_/g, ' ')}).`);
    setLoading(false);
    handleSuccessfulAuth();
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoading(true);
    await login(loginEmail.trim());

    // Switch portal based on matching predefined user or default to distributor
    const matched = PREDEFINED_USERS.find((u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (matched) {
      if (matched.role === 'distributor') {
        setPortalMode('distributor');
        if (matched.distributorId) setActiveDistributorId(matched.distributorId);
      } else {
        setPortalMode('manufacturer');
        if (matched.tenantId) setActiveTenantId(matched.tenantId);
      }
    } else {
      setPortalMode('distributor');
    }

    addToast('success', 'JWT Signed In', `Authenticated as ${loginEmail.trim()}.`);
    setLoading(false);
    handleSuccessfulAuth();
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !signupEmail.trim()) {
      addToast('error', 'Missing Information', 'Please provide Company Name, Contact Person, and Email.');
      return;
    }

    setLoading(true);

    const signupInput = {
      role: signupRole,
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      phone: signupPhone.trim() || '+91 98765 43210',
      drugLicenseNumber: drugLicenseNumber.trim() || (signupRole === 'distributor' ? '20B-MH-2026-8889' : 'MFG-MH-2026-1122'),
      gstin: gstin.trim() || '27AABCP1234F1Z5',
      state,
      city: city.trim() || 'Central District',
    };

    // 1. Register in StoreContext entity database
    if (signupRole === 'distributor') {
      registerNewDistributor(signupInput);
    } else {
      registerNewTenant(signupInput);
    }

    // 2. Issue Cryptographic JWT Session
    await signup(signupInput);

    setLoading(false);
    handleSuccessfulAuth();
  };

  const handleGuestContinue = () => {
    logout();
    setLoginPromptMessage('');
    addToast('info', 'Guest Browsing Mode', 'You are browsing as a guest. Login required before placing orders.');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-6">
        <PharmaPattern opacity={0.04} />

        {/* Modal Header */}
        <div className="relative flex items-start justify-between gap-4">
          <BrandLogo size="md" />

          {!forceRequired && onClose && (
            <button
              onClick={() => {
                setLoginPromptMessage('');
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Action Intercept Context Banner (e.g. from Add to Cart) */}
        {loginPromptMessage ? (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <span className="font-extrabold block text-[13px]">Login Required to Continue</span>
              <p className="text-[11px] text-amber-800 mt-0.5">{loginPromptMessage}</p>
            </div>
          </div>
        ) : null}

        {/* Expired Token Notice */}
        {isTokenExpired && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Your previous JWT session has expired. Please re-authenticate.</span>
            </div>
            <button
              onClick={() => refreshAccessToken()}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
            >
              Silent Refresh
            </button>
          </div>
        )}

        {/* 3-Tab Navigation Strip: Sign In | Sign Up | 1-Click Demo */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-white text-[#1A504C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-white text-[#1A504C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-white text-[#1A504C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demo Personas</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">
                Registered Work Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="rajesh@medpluslogistics.in or acme.admin@pharmxpress.in"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1A504C] focus:ring-2 focus:ring-[#1A504C]/10 text-xs font-semibold"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-extrabold text-slate-700 block">Password</label>
                <span className="text-[11px] text-gray-400">Default: password123</span>
              </div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1A504C] focus:ring-2 focus:ring-[#1A504C]/10 text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1A504C] to-[#123E3A] hover:from-[#143F3C] hover:to-[#0A2624] text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In & Generate JWT Token</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>New Wholesale Stockist or Manufacturer?</span>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="font-extrabold text-[#1A504C] hover:underline"
              >
                Create B2B Account
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP / REGISTER B2B ACCOUNT */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs max-h-[440px] overflow-y-auto pr-1">
            {/* Account Type Selector */}
            <div>
              <label className="font-extrabold text-slate-700 block mb-1.5">
                Select Account Trading Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('distributor')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    signupRole === 'distributor'
                      ? 'border-[#1A504C] bg-[#E8F3F1] text-[#1A504C] font-extrabold shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Store className="w-4 h-4 text-[#1A504C]" />
                    <span>Wholesale Buyer</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Form 20B/21B Pharmacy / Stockist</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('manufacturer')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    signupRole === 'manufacturer'
                      ? 'border-[#1A504C] bg-[#E8F3F1] text-[#1A504C] font-extrabold shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 className="w-4 h-4 text-[#1A504C]" />
                    <span>Manufacturer</span>
                  </div>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Form 25/28 Principal Seller</span>
                </button>
              </div>
            </div>

            {/* Company & Contact Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  {signupRole === 'distributor' ? 'Pharmacy / Stockist Name *' : 'Manufacturing Company *'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={signupRole === 'distributor' ? 'e.g. Apex Health Logistics' : 'e.g. Apex Biotech Ltd'}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Authorized Contact Person *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Manish Verma"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-semibold"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="manish@apexhealth.in"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-semibold"
                />
              </div>
            </div>

            {/* Regulatory: Drug License & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  {signupRole === 'distributor' ? 'Drug License (Form 20B/21B) *' : 'Manufacturing License (Form 25) *'}
                </label>
                <input
                  type="text"
                  value={drugLicenseNumber}
                  onChange={(e) => setDrugLicenseNumber(e.target.value)}
                  placeholder={signupRole === 'distributor' ? '20B-MH-2026-9812' : 'MFG-MH-2026-0099'}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AABCA9999F1Z9"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-[#1A504C] text-xs font-mono font-semibold"
                />
              </div>
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">State / Territory</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi">Delhi NCT</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Lucknow, Kanpur"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1A504C] to-[#123E3A] hover:from-[#143F3C] hover:to-[#0A2624] text-white font-extrabold text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#4BE1E4]" />
              <span>Complete B2B Registration & Generate JWT</span>
            </button>
          </form>
        )}

        {/* TAB 3: 1-CLICK DEMO PERSONA SWITCHER */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Instant evaluation profiles (Bypass manual typing)</span>
              <span>1-Click Bearer Token</span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {PREDEFINED_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectPredefined(user)}
                  disabled={loading}
                  className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#1A504C] hover:bg-[#F5F8F6] text-left transition-all group flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${user.avatarColor} text-white font-bold flex items-center justify-center shrink-0 shadow-2xs`}>
                      {user.role === 'distributor' ? (
                        <Store className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors">
                          {user.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-[#1A504C] bg-[#E8F3F1] border border-[#1A504C]/20">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">{user.designation}</span>
                    </div>
                  </div>

                  <span className="text-xs text-[#1A504C] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>

            {/* Guest Browsing Button */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 text-[11px]">Want to browse as unauthenticated guest?</span>
              <button
                type="button"
                onClick={handleGuestContinue}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-[11px] transition-colors"
              >
                Browse as Guest
              </button>
            </div>
          </div>
        )}

        {/* Footer info: JWT Security Spec */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#1A504C]" />
            <span>Cryptographic HMAC-SHA256 JWT • 15m Token Expiration</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">CDSCO Form 20B/21B Gate</span>
        </div>
      </div>
    </div>
  );
};
