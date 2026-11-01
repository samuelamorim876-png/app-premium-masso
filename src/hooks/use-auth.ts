import { useCallback, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Subscription, User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

type AuthStore = {
  state: AuthState;
  listeners: Set<() => void>;
  initialized: boolean;
  loggingOut: boolean;
  activeCheckTimer: ReturnType<typeof setInterval> | null;
  safetyTimer: ReturnType<typeof setTimeout> | null;
  authSubscription: Subscription | null;
};

const SERVER_SNAPSHOT: AuthState = { user: null, loading: true };
const LOGIN_TIMEOUT_MS = 15000;
const AUTH_INIT_TIMEOUT_MS = 8000;

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "",
  };
}

function getStore(): AuthStore {
  const g = globalThis as typeof globalThis & { __massoterapiaAuthStore?: AuthStore };
  if (!g.__massoterapiaAuthStore) {
    g.__massoterapiaAuthStore = {
      state: { user: null, loading: true },
      listeners: new Set(),
      initialized: false,
      loggingOut: false,
      activeCheckTimer: null,
      safetyTimer: null,
      authSubscription: null,
    };
  }
  return g.__massoterapiaAuthStore;
}

const store = getStore();

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

function setState(next: Partial<AuthState>) {
  const nextState = { ...store.state, ...next };
  if (store.state.user === nextState.user && store.state.loading === nextState.loading) return;
  store.state = nextState;
  store.listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  initAuth();
  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return store.state;
}

function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

function isNetworkError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed") || m.includes("network request failed") || m.includes("fetch failed");
}

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor agora. Verifique sua internet e tente novamente em alguns segundos.";

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (isNetworkError(message)) return NETWORK_ERROR_MESSAGE;
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Seu e-mail ainda não foi confirmado.";
  if (m.includes("too many requests") || m.includes("rate limit")) return "Muitas tentativas seguidas. Aguarde um minuto e tente novamente.";
  return message;
}

async function signInWithRetry(email: string, password: string) {
  // O servidor pode levar alguns segundos para responder ao "acordar"; tenta de novo antes de falhar.
  const delays = [0, 2000, 5000];
  let last: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>> | null = null;
  for (const delay of delays) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      last = await supabase.auth.signInWithPassword({ email, password });
      if (!last.error || !isNetworkError(last.error.message)) return last;
    } catch (err) {
      if (!(err instanceof Error) || !isNetworkError(err.message)) throw err;
    }
  }
  if (last) return last;
  throw new Error(NETWORK_ERROR_MESSAGE);
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function checkActive(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();

    if (error) return true;
    if (!profile) return false;
    return profile.is_active !== false;
  } catch {
    return true;
  }
}

async function forceLogout(message?: string) {
  if (store.loggingOut) return;
  store.loggingOut = true;
  try {
    await supabase.auth.signOut();
  } catch {
    // Keep local auth state consistent even if the network request fails.
  }
  setState({ user: null, loading: false });
  if (message && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("auth_logout_message", message);
  }
  store.loggingOut = false;
}

function validateActiveInBackground(user: User, options?: { quiet?: boolean }) {
  window.setTimeout(async () => {
    const active = await checkActive(user.id);
    const currentUser = store.state.user;
    if (!active && currentUser?.id === user.id) {
      await forceLogout("Seu acesso foi desativado ou removido pelo administrador.");
      return;
    }
    if (!options?.quiet && currentUser?.id === user.id) {
      setState({ user: mapUser(user), loading: false });
    }
  }, 0);
}

function startProductionActiveMonitor() {
  if (isPreviewEnv() || store.activeCheckTimer) return;

  store.activeCheckTimer = setInterval(async () => {
    const currentUser = store.state.user;
    if (!currentUser) return;
    const active = await checkActive(currentUser.id);
    if (!active) {
      await forceLogout("Seu acesso foi desativado ou removido pelo administrador.");
    }
  }, 300000); // o bloqueio imediato chega pelo canal em tempo real abaixo; isto é só uma checagem de segurança

  supabase
    .channel("profile-status-singleton")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
      const currentUser = store.state.user;
      if (!currentUser) return;
      if (payload.new && (payload.new as any).id === currentUser.id && (payload.new as any).is_active === false) {
        forceLogout("Seu acesso foi desativado pelo administrador.");
      }
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "profiles" }, (payload) => {
      const currentUser = store.state.user;
      if (!currentUser) return;
      if (payload.old && (payload.old as any).id === currentUser.id) {
        forceLogout("Seu acesso foi removido pelo administrador.");
      }
    })
    .subscribe();
}

function initAuth() {
  if (store.initialized || typeof window === "undefined") return;
  store.initialized = true;

  store.authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      setState({ user: null, loading: false });
      return;
    }

    if (session?.user) {
      setState({ user: mapUser(session.user), loading: false });
      validateActiveInBackground(session.user, { quiet: true });
      return;
    }

    if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      setState({ user: null, loading: false });
    }
  }).data.subscription;

  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      if (session?.user) {
        setState({ user: mapUser(session.user), loading: false });
        validateActiveInBackground(session.user, { quiet: true });
      } else {
        setState({ user: null, loading: false });
      }
    })
    .catch(() => {
      setState({ user: null, loading: false });
    });

  store.safetyTimer = setTimeout(() => {
    if (store.state.loading) setState({ loading: false });
  }, AUTH_INIT_TIMEOUT_MS);

  startProductionActiveMonitor();
}

if (typeof window !== "undefined") {
  initAuth();
}

export function useAuth() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      setState({ loading: true });
      const { error, data } = await withTimeout(
        signInWithRetry(email, password),
        LOGIN_TIMEOUT_MS + 7000,
        "O login demorou demais para responder. Tente novamente."
      );

      if (error) {
        setState({ user: null, loading: false });
        return translateAuthError(error.message);
      }

      if (data.user) {
        const active = await withTimeout(
          checkActive(data.user.id),
          LOGIN_TIMEOUT_MS,
          "Não foi possível validar seu acesso agora. Tente novamente."
        );
        if (!active) {
          await forceLogout("Seu acesso foi desativado ou removido pelo administrador.");
          return "Seu acesso foi desativado ou removido pelo administrador.";
        }
        setState({ user: mapUser(data.user), loading: false });
      } else {
        setState({ user: null, loading: false });
      }

      return null;
    } catch (error) {
      setState({ loading: false });
      return error instanceof Error ? translateAuthError(error.message) : "Não foi possível entrar. Tente novamente.";
    }
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
    await forceLogout();
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
