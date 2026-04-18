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
import EmployeeManagementPage from "@/features/employees/pages/EmployeeManagementPage";
import { WorkforceRosterPage } from "@/features/workforce-roster";
import DashboardPage from "@/features/dashboard/pages/Dashboard";
import UnauthorizedPage from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import TablePage from "@/features/pos/pages/TablePage";
import KitchenPage from "@/features/kitchen/pages/KitchenPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import CrmPage from "@/features/crm/pages/CrmPage";
import { EmployeesPage, AttendancePage, ShiftsPage, PayrollPage } from "@/features/erp/pages";
import PosPage from "./features/pos/pages/PosPage";
import PurchaseOrdersPage from "./features/purchase-orders/pages/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "./features/purchase-orders/pages/CreatePurchaseOrderPage";
import PurchaseOrderDetailsPage from "./features/purchase-orders/pages/PurcahseOrderDetailsPage";
import { VendorsPage } from "@/features/vendors";
import SignupPage from "./features/auth/pages/SignupPage";
import { KPIAnalyticsPage } from "./features/analytics";
import { MenuItemsPage } from "@/features/menu";


const queryClient = new QueryClient();

const ErpRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["Owner", "Manager"]}>{children}</ProtectedRoute>
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
                  <ProtectedRoute allowedRoles={["Owner", "Manager"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route
                  path="pos/tables"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager", "Waiter"]}>
                      <TablePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos/tables/:tableId"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager", "Waiter"]}>
                      <PosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="kitchen"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager", "Chef"]}>
                      <KitchenPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager"]}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="crm"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager"]}>
                      <CrmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute allowedRoles={["Owner", "Manager"]}>
                      <KPIAnalyticsPage/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings/employees"
                  element={
                    <ProtectedRoute allowedRoles={["Owner"]}>
                      <EmployeeManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="erp/employees" element={<ErpRoute><EmployeesPage /></ErpRoute>} />
                <Route path="erp/attendance" element={<ErpRoute><AttendancePage /></ErpRoute>} />
                <Route path="erp/shifts" element={<ErpRoute><ShiftsPage /></ErpRoute>} />
                <Route path="erp/payroll" element={<ErpRoute><PayrollPage /></ErpRoute>} />
                 <Route path="workforce-roster" element={<ErpRoute><WorkforceRosterPage /></ErpRoute>} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />

                <Route path="purchase-orders" element={<ProtectedRoute allowedRoles={["Owner", "Manager", "Inventory Manager"]}><PurchaseOrdersPage /></ProtectedRoute>} />
                <Route path="purchase-orders/new" element={<ProtectedRoute allowedRoles={["Owner", "Manager", "Inventory Manager"]}><CreatePurchaseOrderPage /></ProtectedRoute>} />
                <Route path="purchase-orders/:id" element={<ProtectedRoute allowedRoles={["Owner", "Manager", "Inventory Manager"]}><PurchaseOrderDetailsPage /></ProtectedRoute>} />
                <Route path="vendors" element={<ProtectedRoute allowedRoles={["Owner", "Manager", "Inventory Manager"]}><VendorsPage /></ProtectedRoute>} />
                <Route path="menu" element={<ProtectedRoute allowedRoles={["Owner", "Manager"]}><MenuItemsPage /></ProtectedRoute>} />
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
