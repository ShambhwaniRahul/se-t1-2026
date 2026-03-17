import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-4" />

      <div className="flex flex-1 items-center justify-end gap-2">
        <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
          DEV
        </Badge>
        <RoleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
