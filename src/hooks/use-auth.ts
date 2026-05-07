import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "",
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkActive = useCallback(async (userId: string): Promise<boolean> => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();
    return profile?.is_active !== false;
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const active = await checkActive(session.user.id);
        if (!active) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(mapUser(session.user));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const active = await checkActive(session.user.id);
        if (!active) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(mapUser(session.user));
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkActive]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    // Check if user profile is active
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        return "Seu acesso foi desativado. Entre em contato com o administrador.";
      }
    }

    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    if (error) return error.message;
    return null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return error.message;
    return null;
  }, []);

  return { user, loading, login, register, logout, resetPassword };
}
