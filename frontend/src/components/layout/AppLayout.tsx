import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./AppHeader";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-gradient-to-br from-background via-background/95 to-primary/5">
        <AppSidebar />
        <div className="flex flex-1 flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
