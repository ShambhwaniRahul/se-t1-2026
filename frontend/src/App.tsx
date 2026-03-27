// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";


import LoginPage from "@/features/auth/pages/LoginPage";
import EmployeeManagementPage from "@/features/employees/pages/EmployeesPage";
import DashboardPage from "@/features/dashboard/pages/Dashboard";
import UnauthorizedPage from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import TablePage from "@/features/pos/pages/TablePage";
import KitchenPage from "@/features/kitchen/pages/KitchenPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import CrmPage from "@/features/crm/pages/CrmPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import { EmployeesPage, AttendancePage, ShiftsPage, PayrollPage } from "@/features/erp/pages";
import PosPage from "./features/pos/pages/PosPage";
import PurchaseOrdersPage from "./features/purchase-orders/pages/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "./features/purchase-orders/pages/CreatePurchaseOrderPage";
import PurchaseOrderDetailsPage from "./features/purchase-orders/pages/PurcahseOrderDetailsPage";
import SignupPage from "./features/auth/pages/SignupPage";


const queryClient = new QueryClient();

const ErpRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["owner", "manager"]}>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          {/* <Toaster /> */}
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public auth routes */}
              <Route path="signup" element={<SignupPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* Protected app shell */}
              <Route element={<AppLayout />}>
                <Route index element={
                  <ProtectedRoute allowedRoles={["owner", "manager"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route
                  path="pos/tables"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager", "pos"]}>
                      <TablePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos/tables/:tableId"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager", "pos"]}>
                      <PosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="kitchen"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager", "kitchen"]}>
                      <KitchenPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager"]}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="crm"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager"]}>
                      <CrmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute allowedRoles={["owner", "manager"]}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings/employees"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <EmployeeManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="erp/employees" element={<ErpRoute><EmployeesPage /></ErpRoute>} />
                <Route path="erp/attendance" element={<ErpRoute><AttendancePage /></ErpRoute>} />
                <Route path="erp/shifts" element={<ErpRoute><ShiftsPage /></ErpRoute>} />
                <Route path="erp/payroll" element={<ErpRoute><PayrollPage /></ErpRoute>} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />

                <Route path="purchase-orders" element={<ProtectedRoute allowedRoles={["owner", "manager", "procurement"]}><PurchaseOrdersPage /></ProtectedRoute>} />
                <Route path="purchase-orders/new" element={<ProtectedRoute allowedRoles={["owner", "manager", "procurement"]}><CreatePurchaseOrderPage /></ProtectedRoute>} />
                <Route path="purchase-orders/:id" element={<ProtectedRoute allowedRoles={["owner", "manager", "procurement"]}><PurchaseOrderDetailsPage /></ProtectedRoute>} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />

              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
