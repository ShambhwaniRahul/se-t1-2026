import api from "@/lib/api";
import type { Employee } from "@/config/types/role";

export const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await api.get("/hr/auth/employees/");
  return response.data.data;
};

export const createEmployee = async (data: any): Promise<Employee> => {
  const response = await api.post("/hr/auth/register/", data);
  return response.data.data;
};

export const updateEmployee = async (id: number, data: any): Promise<Employee> => {
  const response = await api.patch(`/hr/auth/employees/${id}/`, data);
  return response.data.data;
};

export const changePassword = async (id: number, data: any): Promise<void> => {
  await api.patch(`/hr/auth/employees/${id}/change-password/`, data);
};

export const computeSalaryPreview = async (employeeId: number, month: string) => {
  const response = await api.get(`/hr/auth/salary-computation/?employee_id=${employeeId}&month=${month}`);
  return response.data.data;
};

export const processSalaryPayment = async (payload: any) => {
  const response = await api.post("/hr/auth/salary-slips/", payload);
  return response.data;
};

export const fetchSalaryHistory = async (month?: string) => {
  const url = month ? `/hr/auth/salary-slips/?month=${month}` : "/hr/auth/salary-slips/";
  const response = await api.get(url);
  return response.data.data;
};