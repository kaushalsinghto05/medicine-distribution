import React, { useState } from 'react';
import { useAuth, PREDEFINED_USERS } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { inspectJWTRaw } from '../../utils/jwt';
import {
  KeyRound,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Clock,
  Terminal,
  LogOut,
  UserCheck,
  Building2,
  Store,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const JwtDebuggerBar: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const {
    session,
    currentUser,
    isAuthenticated,
    isTokenExpired,
    accessToken,
    logout,
    refreshAccessToken,
    switchPredefinedUser,
    expireTokenNowForTesting,
  } = useAuth();

  const { setPortalMode, setActiveTenantId, setActiveDistributorId, addToast } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const inspected = accessToken ? inspectJWTRaw(accessToken) : null;

  // Calculate remaining seconds
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = currentUser?.exp ? Math.max(0, currentUser.exp - now) : 0;
  const minutesLeft = Math.floor(secondsLeft / 60);

  const handleQuickSwitch = (userId: string) => {
    const user = PREDEFINED_USERS.find((u) => u.id === userId);
    if (!user) return;

    switchPredefinedUser(userId);

    if (user.role === 'distributor') {
      setPortalMode('distributor');
      if (user.distributorId) setActiveDistributorId(user.distributorId);
    } else {
      setPortalMode('manufacturer');
      if (user.tenantId) setActiveTenantId(user.tenantId);
    }

    addToast('info', 'JWT Persona Switched', `Token re-issued for ${user.name} (${user.role}).`);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 text-white text-xs font-mono select-none">
      {/* Condensed Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            JWT Debugger
          </span>

          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300">
                User: <strong className="text-white">{currentUser.name}</strong>
              </span>
              <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${
                currentUser.role === 'manufacturer_admin'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700'
                  : currentUser.role === 'manufacturer_staff'
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                  : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700'
              }`}>
                {currentUser.role}
              </span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                • Tenant/Buyer:{' '}
                <span className="text-sky-300">{currentUser.tenantId || currentUser.distributorId}</span>
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Exp in {minutesLeft}m {secondsLeft % 60}s</span>
              </span>
            </div>
          ) : (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {isTokenExpired ? 'JWT Token Expired' : 'Not Authenticated'}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={() => refreshAccessToken()}
                title="Simulate silent refresh of access token"
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh Token</span>
              </button>

              <button
                onClick={expireTokenNowForTesting}
                title="Force-expire the token immediately to test expiration handling"
                className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] transition-colors"
              >
                Simulate Expiry
              </button>

              <button
                onClick={logout}
                title="Clear JWT from storage and logout"
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </>
          )}

          {!isAuthenticated && (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Decoded Token Viewer */}
      {isExpanded && inspected && (
        <div className="border-t border-slate-800 bg-slate-950 p-4 animate-in slide-in-from-bottom-2 duration-150 space-y-4">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Quick Switch Persona Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
                Quick-Switch User Persona (Instant Token Re-Issue):
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {PREDEFINED_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickSwitch(u.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      currentUser?.sub === u.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 ring-2 ring-sky-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {u.name} ({u.role.replace(/_/g, ' ')})
                  </button>
                ))}
              </div>
            </div>

            {/* Decoded Segments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              {/* Header */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-rose-400 font-bold block text-[10px] uppercase tracking-wider">
                  Header (JOSE)
                </span>
                <pre className="text-slate-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                  {JSON.stringify(inspected.header, null, 2)}
                </pre>
              </div>

              {/* Payload Claims */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
                <span className="text-indigo-400 font-bold block text-[10px] uppercase tracking-wider">
                  Decoded Claims Payload (Scoped Authorizations)
                </span>
                <pre className="text-slate-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                  {JSON.stringify(inspected.payload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Raw Token String */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-sky-400 font-bold block text-[10px] uppercase tracking-wider">
                Raw Compact Token (Bearer {accessToken?.slice(0, 30)}...)
              </span>
              <p className="text-[10px] text-slate-400 font-mono break-all bg-black/40 p-2 rounded-lg">
                {accessToken}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
