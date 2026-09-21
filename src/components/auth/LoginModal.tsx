import React, { useState } from 'react';
import { useAuth, PREDEFINED_USERS, PredefinedUser } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  Building2,
  Store,
  KeyRound,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Activity,
  AlertCircle,
  X,
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
  const { login, isTokenExpired, refreshAccessToken } = useAuth();
  const { setPortalMode, setActiveTenantId, setActiveDistributorId, addToast } = useStore();

  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'manufacturer_admin' | 'manufacturer_staff' | 'distributor'>('manufacturer_admin');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPredefined = async (user: PredefinedUser) => {
    setLoading(true);
    await login(user);

    // Synchronize StoreContext portal and persona
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

    addToast('success', 'JWT Session Authenticated', `Signed in as ${user.name} (${user.role}). Bearer token issued.`);
    setLoading(false);
    if (onClose) onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setLoading(true);
    await login(customEmail);

    if (selectedRole === 'distributor') {
      setPortalMode('distributor');
    } else {
      setPortalMode('manufacturer');
    }

    addToast('success', 'Custom JWT Issued', `Authenticated as ${customEmail}.`);
    setLoading(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <PharmaPattern opacity={0.04} />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-4">
          <BrandLogo size="md" />

          {!forceRequired && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

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

        {/* Login Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quick Persona Switcher
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Enter Credentials
          </button>
        </div>

        {activeTab === 'quick' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-[#8A8578] font-sans">
              <span>Select persona to issue token</span>
              <span>Permissions & claims</span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {PREDEFINED_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectPredefined(user)}
                  disabled={loading}
                  className="w-full p-3 rounded-xl border border-gray-200 hover:border-[#1A504C] hover:bg-[#F5F8F6] text-left transition-colors group flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${user.avatarColor} text-white font-bold flex items-center justify-center shrink-0 shadow-2xs`}>
                      {user.role === 'distributor' ? (
                        <Store className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A1A1A] group-hover:text-[#1A504C] transition-colors">
                          {user.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#1A504C] bg-[#E8F3F1] border border-[#1A504C]/20">
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] block">{user.designation}</span>
                    </div>
                  </div>

                  <span className="text-xs text-[#1A504C] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="officer@pharmxpress.in"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Account Role Claim</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800"
              >
                <option value="manufacturer_admin">Manufacturer Admin (Full Authorization)</option>
                <option value="manufacturer_staff">Manufacturer Staff (Operations / Quota View)</option>
                <option value="distributor">Authorized Wholesale Distributor (Buyer)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors pt-3"
            >
              Sign In & Generate JWT
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Short-lived access token (15 min) + 7-day silent refresh</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Bearer Token Auth</span>
        </div>
      </div>
    </div>
  );
};
