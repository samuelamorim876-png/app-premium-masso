import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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

function isPreviewEnv(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  return (
    h.includes("id-preview--") ||
    h.includes("lovableproject.com") ||
    h.includes("lovableproject-dev.com") ||
    h.includes("preview--")
  );
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<AuthUser | null>(null);
  const loggingOutRef = useRef(false);

  const forceLogout = useCallback(async (message?: string) => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    userRef.current = null;
    if (message) {
      sessionStorage.setItem("auth_logout_message", message);
    }
    // Don't reload — just clear state. The UI will show login.
    loggingOutRef.current = false;
  }, []);

  const checkActive = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", userId)
        .maybeSingle();
      if (!profile) return false;
      return profile.is_active !== false;
    } catch {
      // Network error — assume active to avoid false lockouts
      return true;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const active = await checkActive(session.user.id);
        if (!active) {
          await forceLogout("Seu acesso foi desativado pelo administrador.");
          setLoading(false);
          return;
        }
        const mapped = mapUser(session.user);
        setUser(mapped);
        userRef.current = mapped;
      } else {
        setUser(null);
        userRef.current = null;
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const active = await checkActive(session.user.id);
        if (!active) {
          await forceLogout("Seu acesso foi desativado pelo administrador.");
          setLoading(false);
          return;
        }
        const mapped = mapUser(session.user);
        setUser(mapped);
        userRef.current = mapped;
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkActive, forceLogout]);

  // Realtime listener — only in production (not preview)
  useEffect(() => {
    if (isPreviewEnv()) return;

    const channel = supabase
      .channel("profile-status-watch")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const currentUser = userRef.current;
          if (!currentUser) return;
          if (payload.new && (payload.new as any).id === currentUser.id) {
            if ((payload.new as any).is_active === false) {
              forceLogout("Seu acesso foi desativado pelo administrador.");
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "profiles" },
        (payload) => {
          const currentUser = userRef.current;
          if (!currentUser) return;
          if (payload.old && (payload.old as any).id === currentUser.id) {
            forceLogout("Seu acesso foi desativado pelo administrador.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [forceLogout]);

  // Periodic status check every 60s — only in production
  useEffect(() => {
    if (isPreviewEnv()) return;

    const interval = setInterval(async () => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      const active = await checkActive(currentUser.id);
      if (!active) {
        forceLogout("Seu acesso foi desativado pelo administrador.");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [checkActive, forceLogout]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile || profile.is_active === false) {
        await supabase.auth.signOut();
        return "Seu acesso foi desativado pelo administrador.";
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
    userRef.current = null;
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
