import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AppRole, Employee } from "@/config/types/role";
import api from "@/lib/api";
import type { ApiResponse } from "@/config/types/api";

interface AuthContextValue {
  user: Employee | null;
  role: AppRole;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<ApiResponse>;
  logout: () => void;
  // addEmployee: (emp: Employee) => void;
  // updateEmployee: (id: string, data: Partial<Employee>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);

  // =======================
  // RESTORE SESSION
  // =======================  
  useEffect(() => {
    const token = localStorage.getItem("access");
    const employee = localStorage.getItem("employee");

    if (token && employee) {
      setUser(JSON.parse(employee));
    }
  }, []);

  // =======================
  // LOGIN
  // =======================
  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const res = await api.post("hr/auth/login/", {
          phone_no: identifier,
          password,
        });

        if (!res.data.success) {
          return res.data
        }

        localStorage.setItem("access", res.data.data.access);
        localStorage.setItem("refresh", res.data.data.refresh);
        localStorage.setItem("employee", JSON.stringify(res.data.data.employee))
        // localStorage.setItem("roles", JSON.stringify(res.data.data.employee.role));

        setUser(res.data.data.employee);

        return res.data;
      } catch (err: any) {
        return {
          success: false,
          message:
            err?.response?.data?.detail ||
            "Login failed",
          data: []
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

  // const addEmployee = useCallback((emp: Employee) => {
  //   setEmployees((prev) => [...prev, emp]);
  // }, []);

  // const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
  //   setEmployees((prev) =>
  //     prev.map((e) => (e.id === id ? { ...e, ...data } : e))
  //   );
  //   // If the logged-in user updates themselves, reflect it
  //   setUser((prev) => {
  //     if (!prev || prev.id !== id) return prev;
  //     return { ...prev, ...data } as Employee;
  //   });
  // }, []);

  const role = user?.roles?.[0]?.role_display ?? "Other";
  console.log("USER ROLES:", user?.roles)

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated: !!user, login, logout }}
      // value={{ user, role, isAuthenticated: !!user, login, logout, addEmployee, updateEmployee }}
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
