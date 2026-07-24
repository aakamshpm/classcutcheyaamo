import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, ApiError } from "@/lib/api";
import { clearSession, loadSession, saveSession } from "@/lib/session";

type AuthState = {
  token: string | null;
  username: string | null;
  // still checking secure storage on boot
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    username: null,
    loading: true,
  });

  // restore any saved session on first mount
  useEffect(() => {
    let active = true;
    (async () => {
      const session = await loadSession();
      if (!active) return;
      setState({
        token: session?.token ?? null,
        username: session?.username ?? null,
        loading: false,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function establish(res: { token: string; user: { username: string } }) {
      await saveSession(res.token, res.user.username);
      setState({
        token: res.token,
        username: res.user.username,
        loading: false,
      });
    }

    return {
      ...state,
      login: async (username, password) => {
        const res = await api.login(username, password);
        await establish(res);
      },
      signup: async (username, password) => {
        const res = await api.signup(username, password);
        await establish(res);
      },
      logout: async () => {
        await clearSession();
        setState({ token: null, username: null, loading: false });
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
