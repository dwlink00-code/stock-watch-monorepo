import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { login as loginRequest, register as registerRequest } from "../api/client";
import type { User } from "../types/api";

const SESSION_STORAGE_KEY = "stock-watch-session";

type Session = {
  token: string;
  user: User;
};

async function getStoredSession(key: string) {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredSession(key: string, value: string) {
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStoredSession(key: string) {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

type AuthContextValue = {
  session: Session | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const stored = await getStoredSession(SESSION_STORAGE_KEY);

        if (stored) {
          setSession(JSON.parse(stored) as Session);
        }
      } catch (error) {
        console.warn("Failed to restore session", error);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, []);

  const persistSession = useCallback(async (nextSession: Session) => {
    await setStoredSession(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const nextSession = await loginRequest(email, password);
      await persistSession(nextSession);
    },
    [persistSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const nextSession = await registerRequest(name, email, password);
      await persistSession(nextSession);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await removeStoredSession(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [isBootstrapping, login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
