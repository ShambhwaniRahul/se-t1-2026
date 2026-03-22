import React, { createContext, useContext, useState, useCallback } from "react";
import type { AppRole, AppUser } from "@/types/roles";
import { MOCK_EMPLOYEES, type MockEmployee } from "@/data/mockEmployee";

interface AuthContextValue {
  user: AppUser | null;
  role: AppRole;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  employees: MockEmployee[];
  addEmployee: (emp: MockEmployee) => void;
  updateEmployee: (id: string, data: Partial<MockEmployee>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [employees, setEmployees] = useState<MockEmployee[]>(MOCK_EMPLOYEES);

  const login = useCallback(
    (identifier: string, password: string) => {
      const trimmed = identifier.trim().toLowerCase();
      const emp = employees.find(
        (e) =>
          (e.email.toLowerCase() === trimmed || e.phone === trimmed) &&
          e.password === password
      );

      if (!emp) return { success: false, error: "Invalid credentials" };
      if (emp.status === "disabled") return { success: false, error: "Account is disabled" };

      setUser({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        department: emp.department,
        status: emp.status,
      });
      return { success: true };
    },
    [employees]
  );

  const logout = useCallback(() => setUser(null), []);

  const addEmployee = useCallback((emp: MockEmployee) => {
    setEmployees((prev) => [...prev, emp]);
  }, []);

  const updateEmployee = useCallback((id: string, data: Partial<MockEmployee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
    // If the logged-in user updates themselves, reflect it
    setUser((prev) => {
      if (!prev || prev.id !== id) return prev;
      return { ...prev, ...data } as AppUser;
    });
  }, []);

  const role = user?.role ?? "pos";

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated: !!user, login, logout, employees, addEmployee, updateEmployee }}
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
