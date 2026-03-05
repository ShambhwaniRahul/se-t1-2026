import React, { createContext, useContext, useState, useCallback } from "react";
import type { AppRole, AppUser } from "@/types/roles";

interface AuthContextValue {
  user: AppUser;
  role: AppRole;
  setRole: (role: AppRole) => void;
  isAuthenticated: boolean;
}

const MOCK_USER: AppUser = {
  id: "mock-1",
  name: "Dev User",
  email: "dev@coherence.app",
  role: "admin",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>(MOCK_USER.role);

  const setRole = useCallback((r: AppRole) => {
    setRoleState(r);
  }, []);

  const user: AppUser = { ...MOCK_USER, role };

  return (
    <AuthContext.Provider value={{ user, role, setRole, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
