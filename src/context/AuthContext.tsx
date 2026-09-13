import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JWTPayload, JWTRole, AuthSession } from '../types';
import { signJWT, verifyAndDecodeJWT, canPerformAction } from '../utils/jwt';

export interface PredefinedUser {
  id: string;
  email: string;
  name: string;
  role: JWTRole;
  tenantId?: string;
  distributorId?: string;
  authorizedManufacturerIds: string[];
  designation: string;
  avatarColor: string;
}

export const PREDEFINED_USERS: PredefinedUser[] = [
  {
    id: 'usr-acme-admin-01',
    email: 'acme.admin@pharmxpress.in',
    name: 'Dr. Rajesh Nair',
    role: 'manufacturer_admin',
    tenantId: 'mfg-acme',
    authorizedManufacturerIds: ['mfg-acme'],
    designation: 'Principal Regulatory Officer & Admin, Acme Pharma',
    avatarColor: 'bg-sky-600',
  },
  {
    id: 'usr-acme-staff-01',
    email: 'acme.staff@pharmxpress.in',
    name: 'Pooja Deshmukh',
    role: 'manufacturer_staff',
    tenantId: 'mfg-acme',
    authorizedManufacturerIds: ['mfg-acme'],
    designation: 'Warehouse & Operations Staff, Acme Pharma',
    avatarColor: 'bg-cyan-600',
  },
  {
    id: 'usr-vitalis-admin-01',
    email: 'vitalis.admin@vitalislabs.com',
    name: 'Vikram Joshi',
    role: 'manufacturer_admin',
    tenantId: 'mfg-vitalis',
    authorizedManufacturerIds: ['mfg-vitalis'],
    designation: 'Managing Director & Quality Head, Vitalis Labs',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'usr-dist-medplus-01',
    email: 'rajesh@medpluslogistics.in',
    name: 'Rajesh Sharma',
    role: 'distributor',
    distributorId: 'dist-medplus',
    authorizedManufacturerIds: ['mfg-acme'], // MedPlus is ONLY authorized with Acme!
    designation: 'Authorized Buyer, MedPlus Logistics (Acme Auth Only)',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'usr-dist-apollo-01',
    email: 'suresh@apollodistrib.co.in',
    name: 'Suresh Menon',
    role: 'distributor',
    distributorId: 'dist-apollo',
    authorizedManufacturerIds: ['mfg-vitalis'], // Apollo is ONLY authorized with Vitalis!
    designation: 'Procurement Head, Apollo Distribution (Vitalis Auth Only)',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'usr-dist-carepoint-01',
    email: 'ananya@carepointhealth.com',
    name: 'Ananya Deshmukh',
    role: 'distributor',
    distributorId: 'dist-carepoint',
    authorizedManufacturerIds: ['mfg-acme', 'mfg-vitalis'], // Authorized with both!
    designation: 'Supply Chain VP, CarePoint (Dual Authorized)',
    avatarColor: 'bg-teal-600',
  },
];

interface AuthContextType {
  session: AuthSession | null;
  currentUser: JWTPayload | null;
  isAuthenticated: boolean;
  isTokenExpired: boolean;
  accessToken: string | null;
  login: (emailOrUser: string | PredefinedUser) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  checkPermission: (action: Parameters<typeof canPerformAction>[1]) => boolean;
  switchPredefinedUser: (userId: string) => void;
  expireTokenNowForTesting: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'pharmxpress_jwt_access';
const REFRESH_TOKEN_KEY = 'pharmxpress_jwt_refresh';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);

  // Initialize session from pre-seeded default (Acme Admin) or localStorage simulation
  useEffect(() => {
    const savedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (savedAccess) {
      const verification = verifyAndDecodeJWT(savedAccess);
      if (verification.valid && verification.payload) {
        setSession({
          accessToken: savedAccess,
          refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || 'rt_mock_seed',
          user: verification.payload,
          isExpired: false,
        });
        return;
      }
    }

    // Default startup: initialize with Acme Admin
    const defaultUser = PREDEFINED_USERS[0];
    const initialToken = signJWT({
      sub: defaultUser.id,
      email: defaultUser.email,
      name: defaultUser.name,
      role: defaultUser.role,
      tenantId: defaultUser.tenantId,
      distributorId: defaultUser.distributorId,
      authorizedManufacturerIds: defaultUser.authorizedManufacturerIds,
    }, 900); // 15 mins

    const decoded = verifyAndDecodeJWT(initialToken).payload!;
    const newSession: AuthSession = {
      accessToken: initialToken,
      refreshToken: 'rt_mock_' + Math.random().toString(36).substring(2),
      user: decoded,
      isExpired: false,
    };
    setSession(newSession);
    localStorage.setItem(ACCESS_TOKEN_KEY, initialToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newSession.refreshToken);
  }, []);

  // Periodic token expiration checker (every 5 seconds)
  useEffect(() => {
    if (!session || session.isExpired) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (session.user.exp && session.user.exp <= now) {
        setSession((prev) => (prev ? { ...prev, isExpired: true } : null));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session]);

  const login = async (emailOrUser: string | PredefinedUser): Promise<boolean> => {
    const target = typeof emailOrUser === 'string'
      ? PREDEFINED_USERS.find((u) => u.email.toLowerCase() === emailOrUser.toLowerCase()) || {
          id: 'usr-custom-' + Date.now(),
          email: emailOrUser,
          name: emailOrUser.split('@')[0],
          role: 'distributor' as JWTRole,
          distributorId: 'dist-medplus',
          authorizedManufacturerIds: ['mfg-acme'],
          designation: 'Custom Authenticated User',
          avatarColor: 'bg-slate-700',
        }
      : emailOrUser;

    const token = signJWT({
      sub: target.id,
      email: target.email,
      name: target.name,
      role: target.role,
      tenantId: target.tenantId,
      distributorId: target.distributorId,
      authorizedManufacturerIds: target.authorizedManufacturerIds,
    }, 900); // 15 minutes validity

    const decoded = verifyAndDecodeJWT(token).payload!;
    const newSession: AuthSession = {
      accessToken: token,
      refreshToken: 'rt_mock_' + Math.random().toString(36).substring(2),
      user: decoded,
      isExpired: false,
    };

    setSession(newSession);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, newSession.refreshToken);
    return true;
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!session) return false;
    const refreshedToken = signJWT({
      sub: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      tenantId: session.user.tenantId,
      distributorId: session.user.distributorId,
      authorizedManufacturerIds: session.user.authorizedManufacturerIds,
    }, 900);

    const decoded = verifyAndDecodeJWT(refreshedToken).payload!;
    setSession({
      ...session,
      accessToken: refreshedToken,
      user: decoded,
      isExpired: false,
    });
    localStorage.setItem(ACCESS_TOKEN_KEY, refreshedToken);
    return true;
  };

  const checkPermission = (action: Parameters<typeof canPerformAction>[1]): boolean => {
    if (!session || session.isExpired) return false;
    return canPerformAction(session.user.role, action);
  };

  const switchPredefinedUser = (userId: string) => {
    const user = PREDEFINED_USERS.find((u) => u.id === userId);
    if (user) {
      login(user);
    }
  };

  const expireTokenNowForTesting = () => {
    if (!session) return;
    // Sign token with -10 second expiration
    const expiredToken = signJWT({
      sub: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      tenantId: session.user.tenantId,
      distributorId: session.user.distributorId,
      authorizedManufacturerIds: session.user.authorizedManufacturerIds,
    }, -10);

    const decoded = verifyAndDecodeJWT(expiredToken).payload!;
    setSession({
      ...session,
      accessToken: expiredToken,
      user: decoded,
      isExpired: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser: session ? session.user : null,
        isAuthenticated: !!session && !session.isExpired,
        isTokenExpired: !!session?.isExpired,
        accessToken: session?.accessToken || null,
        login,
        logout,
        refreshAccessToken,
        checkPermission,
        switchPredefinedUser,
        expireTokenNowForTesting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
