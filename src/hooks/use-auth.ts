import { useState } from "react";

interface AuthUser {
  email: string;
  name: string;
}

const AUTH_KEY = "massoterapia-auth";
const USERS_KEY = "massoterapia-users";

function getStoredUsers(): Record<string, { email: string; name: string; password: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getStoredAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredAuth);

  const login = (email: string, password: string): string | null => {
    const users = getStoredUsers();
    const u = users[email];
    if (!u) return "E-mail não encontrado.";
    if (u.password !== password) return "Senha incorreta.";
    const authUser = { email: u.email, name: u.name };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return null;
  };

  const register = (name: string, email: string, password: string): string | null => {
    const users = getStoredUsers();
    if (users[email]) return "E-mail já cadastrado.";
    users[email] = { email, name, password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const authUser = { email, name };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const resetPassword = (email: string): string | null => {
    const users = getStoredUsers();
    if (!users[email]) return "E-mail não encontrado.";
    return null; // In a real app, would send email
  };

  return { user, login, register, logout, resetPassword };
}
