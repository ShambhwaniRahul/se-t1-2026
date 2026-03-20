// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import DashboardPage from "@/pages/Dashboard";
import UnauthorizedPage from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import PosPage from "@/features/pos/PosPage";
import KitchenPage from "@/features/kitchen/KitchenPage";
import InventoryPage from "@/features/inventory/InventoryPage";
import CrmPage from "@/features/crm/CrmPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import SettingsPage from "@/features/settings/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          {/* <Toaster /> */}
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                  }/>
                <Route
                  path="pos"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "manager", "pos"]}>
                      <PosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="kitchen"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "manager", "kitchen"]}>
                      <KitchenPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "manager"]}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="crm"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "manager"]}>
                      <CrmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "manager"]}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
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
