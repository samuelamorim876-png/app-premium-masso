import { useCallback, useSyncExternalStore } from "react";
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

// ---------- Module-level singleton store ----------

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

let state: AuthState = { user: null, loading: true };
const listeners = new Set<() => void>();

function setState(next: Partial<AuthState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return state;
}

function getServerSnapshot(): AuthState {
  return { user: null, loading: true };
}

let initialized = false;
let loggingOut = false;

async function checkActive(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();
    if (error) return true;
    if (!profile) return true;
    return profile.is_active !== false;
  } catch {
    return true;
  }
}

async function forceLogout(message?: string) {
  if (loggingOut) return;
  loggingOut = true;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  setState({ user: null });
  if (message && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("auth_logout_message", message);
  }
  loggingOut = false;
}

function initAuth() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // 1. Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT") {
      setState({ user: null, loading: false });
      return;
    }

    if (session?.user) {
      if (event === "SIGNED_IN") {
        const active = await checkActive(session.user.id);
        if (!active) {
          await forceLogout("Seu acesso foi desativado pelo administrador.");
          setState({ loading: false });
          return;
        }
      }
      setState({ user: mapUser(session.user), loading: false });
    } else {
      setState({ user: null, loading: false });
    }
  });

  // 2. Hydrate current session
  supabase.auth
    .getSession()
    .then(async ({ data: { session } }) => {
      if (session?.user) {
        const active = await checkActive(session.user.id);
        if (!active) {
          await forceLogout("Seu acesso foi desativado pelo administrador.");
          setState({ loading: false });
          return;
        }
        setState({ user: mapUser(session.user), loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    })
    .catch(() => {
      setState({ loading: false });
    });

  // Safety timeout — never stay loading forever
  setTimeout(() => {
    if (state.loading) setState({ loading: false });
  }, 8000);

  // 3. Realtime + periodic active-check (production only)
  if (!isPreviewEnv()) {
    supabase
      .channel(`profile-status-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const u = state.user;
          if (!u) return;
          if (payload.new && (payload.new as any).id === u.id) {
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
          const u = state.user;
          if (!u) return;
          if (payload.old && (payload.old as any).id === u.id) {
            forceLogout("Seu acesso foi desativado pelo administrador.");
          }
        }
      )
      .subscribe();

    setInterval(async () => {
      const u = state.user;
      if (!u) return;
      const active = await checkActive(u.id);
      if (!active) {
        forceLogout("Seu acesso foi desativado pelo administrador.");
      }
    }, 60000);
  }
}

// Kick off init at module load (browser only)
if (typeof window !== "undefined") {
  initAuth();
}

// ---------- Public hook ----------

export function useAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;

      if (data.user) {
        const active = await checkActive(data.user.id);
        if (!active) {
          await supabase.auth.signOut();
          return "Seu acesso foi desativado pelo administrador.";
        }
      }
      return null;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin },
      });
      if (error) return error.message;
      return null;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null });
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return error.message;
    return null;
  }, []);

  return {
    user: snap.user,
    loading: snap.loading,
    login,
    register,
    logout,
    resetPassword,
  };
}
