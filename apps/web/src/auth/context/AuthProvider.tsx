import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { IdentityEngine, type IdentitySession } from '../../identity/identity-engine';
import type { RuntimeRecord } from '../../runtime/runtime-record-store';
import { register, type RegisterRequest, type RegisterResponse } from '../services/auth.api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthContextValue {
  currentUser?: RuntimeRecord;
  error?: string;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<IdentitySession>;
  logout: () => void;
  registerAccount: (payload: RegisterRequest) => Promise<RegisterResponse>;
  resetError: () => void;
  session?: IdentitySession;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const identityEngine = useMemo(() => new IdentityEngine(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [session, setSession] = useState<IdentitySession | undefined>(() => identityEngine.currentSession());
  const currentUser = useMemo(() => {
    if (!session) {
      return undefined;
    }

    return identityEngine.getUser(session.userId);
  }, [identityEngine, session]);

  async function login(payload: LoginRequest) {
    setLoading(true);
    setError(undefined);

    try {
      const session = identityEngine.login({ email: payload.email, password: payload.password });
      setSession(session);
      return session;
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Login failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  async function registerAccount(payload: RegisterRequest) {
    setLoading(true);
    setError(undefined);

    try {
      return await register(payload);
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : 'Registration failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    identityEngine.logout();
    setSession(undefined);
    setError(undefined);
  }

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    error,
    loading,
    login,
    logout,
    registerAccount,
    resetError: () => setError(undefined),
    session,
  }), [currentUser, error, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('AuthProvider is required.');
  }

  return value;
}
