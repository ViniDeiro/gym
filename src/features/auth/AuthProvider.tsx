import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, getToken, setToken } from "@/lib/api";
import { UserProfile } from "@/types/domain";

type AuthContextValue = {
  session: { token: string } | null;
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  setAuthSession: (token: string, profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    const data = await apiRequest<{ user: UserProfile }>("/me");
    setProfile(data.user);
  }

  async function refreshProfile() {
    if (session?.token) {
      await loadProfile();
    }
  }

  useEffect(() => {
    async function boot() {
      const token = await getToken();
      if (token) {
        try {
          setSession({ token });
          await loadProfile();
        } catch {
          await setToken(null);
          setSession(null);
          setProfile(null);
        }
      }
      setLoading(false);
    }

    boot();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: profile,
      profile,
      loading,
      setAuthSession: async (token, nextProfile) => {
        await setToken(token);
        setSession({ token });
        setProfile(nextProfile);
      },
      refreshProfile,
      signOut: async () => {
        await setToken(null);
        setSession(null);
        setProfile(null);
      }
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
