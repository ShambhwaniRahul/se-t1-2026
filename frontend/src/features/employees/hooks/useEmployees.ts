import { useState } from "react";
import type { Employee } from "@/config/types/role";

export function useEmployees(initial: Employee[] = []) {
  const [employees, setEmployees] = useState<Employee[]>(initial);

  const addEmployee = (data: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...data,
      id: Date.now(), // adjust if backend gives id
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const updateEmployee = (id: number, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
  };

  return { employees, addEmployee, updateEmployee };
}