"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AuthSession,
  AuthUser,
  clearStoredSession,
  getStoredSession,
  isSessionExpired,
  LoginCredentials,
  ProfileUpdatePayload,
  loginRequest,
  storeSession,
  updateProfileRequest,
} from "../../lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  updateProfile: (profile: ProfileUpdatePayload) => Promise<AuthSession>;
  logout: () => void;
  refreshSession: () => AuthSession | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const applySession = useCallback((nextSession: AuthSession | null) => {
    if (!nextSession || isSessionExpired(nextSession)) {
      clearStoredSession();
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }

    storeSession(nextSession);
    setSession(nextSession);
    setStatus("authenticated");
    return nextSession;
  }, []);

  const refreshSession = useCallback(() => {
    return applySession(getStoredSession());
  }, [applySession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await loginRequest(credentials);
      applySession(nextSession);
      return nextSession;
    },
    [applySession],
  );

  const updateProfile = useCallback(
    async (profile: ProfileUpdatePayload) => {
      const nextSession = await updateProfileRequest(session, profile);
      applySession(nextSession);
      return nextSession;
    },
    [applySession, session],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    const initialSessionTimeout = window.setTimeout(refreshSession, 0);

    function handleStorage(event: StorageEvent) {
      if (event.key === "ruralize.session") {
        refreshSession();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(initialSessionTimeout);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshSession]);

  useEffect(() => {
    if (!session?.expiresAt) {
      return;
    }

    const millisecondsUntilExpiration = session.expiresAt - Date.now();

    if (millisecondsUntilExpiration <= 0) {
      const timeout = window.setTimeout(logout, 0);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(logout, millisecondsUntilExpiration);
    return () => window.clearTimeout(timeout);
  }, [logout, session?.expiresAt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: status === "authenticated",
      login,
      updateProfile,
      logout,
      refreshSession,
    }),
    [login, logout, refreshSession, session, status, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
