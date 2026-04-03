import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { usernameToEmail } from "@/lib/auth/username";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

type ProfileRow = { username: string; role: UserRole };

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase.from("profiles").select("username, role").eq("id", uid).maybeSingle();
    if (error || !data) {
      setProfile(null);
      return;
    }
    setProfile({ username: data.username, role: data.role as UserRole });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await loadProfile(user.id);
  }, [loadProfile, user?.id]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void loadProfile(data.session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) void loadProfile(sess.user.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (username: string, password: string) => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, loading, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
