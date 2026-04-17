import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AppRole, Employee } from "@/config/types/role";
import api from "@/lib/api";

type LoginResponse =
  | { 
      success: true; 
      message: string; 
      data: {
        access: string; 
        refresh: string;
        employee: Employee;
      }
    }
  | { success: false; message: string; data: null };

interface AuthContextValue {
  user: Employee | null;
  role: AppRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // RESTORE SESSION
  useEffect(() => {
    const token = localStorage.getItem("access");
    const employee = localStorage.getItem("employee");

    if (token && employee) {
      setUser(JSON.parse(employee));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await api.post("hr/auth/login/", {
          phone_no: identifier,
          password,
        });

        if (!res.data.success) return res.data;

        localStorage.setItem("access", res.data.data.access);
        localStorage.setItem("refresh", res.data.data.refresh);
        localStorage.setItem("employee", JSON.stringify(res.data.data.employee))

        setUser(res.data.data.employee);

        return res.data;
      } catch (err: any) {
        return {
          success: false,
          message:
            err?.response?.data?.detail ||
            "Login failed",
          data: null
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("employee");

    setUser(null);
  }, []);


  const role = user?.roles?.[0]?.role_display ?? "Other";

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
