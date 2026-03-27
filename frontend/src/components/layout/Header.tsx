import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
// import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-4" />

      <div className="flex flex-1 items-center justify-end gap-2">
        {user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.name}
          </span>
        )}
        {/* <RoleSwitcher /> */}
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
