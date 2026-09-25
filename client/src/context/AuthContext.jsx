import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "nc-token";
const USER_KEY = "nc-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await api.get("/auth/me");
        if (!cancelled) {
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (email, password) => {
    const { token: nextToken, user: nextUser } = await api.post("/auth/login", { email, password });
    persist(nextToken, nextUser);
    return nextUser;
  };

  const signUp = async (payload) => {
    const { token: nextToken, user: nextUser } = await api.post("/auth/signup", payload);
    persist(nextToken, nextUser);
    return nextUser;
  };

  const signOut = () => {
    persist(null, null);
  };

  const update = async (patch) => {
    const { user: nextUser } = await api.patch("/auth/me", patch);
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signedIn: !!user,
        signIn,
        signUp,
        signOut,
        update
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}