import {
  ShoppingCart,
  ChefHat,
  Package,
  Users,
  BarChart3,
  LayoutDashboard,
  UserCog,
  CalendarCheck,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/types/roles";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: AppRole[];
}

const dashboardItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "manager"] },
];

const operationItems: NavItem[] = [
  { title: "Point of Sale", url: "/pos/tables", icon: ShoppingCart, roles: ["admin", "manager", "pos"] },
  { title: "Kitchen Display", url: "/kitchen", icon: ChefHat, roles: ["admin", "manager", "kitchen"] },
];

const managementItems: NavItem[] = [
  { title: "Inventory", url: "/inventory", icon: Package, roles: ["admin", "manager", "procurement"] },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ShoppingCart, roles: ["admin", "manager", "procurement"] },
  { title: "CRM", url: "/crm", icon: Users, roles: ["admin", "manager"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
];

const erpItems: NavItem[] = [
  { title: "Employees", url: "/erp/employees", icon: UserCog, roles: ["admin", "manager"] },
  { title: "Attendance", url: "/erp/attendance", icon: CalendarCheck, roles: ["admin", "manager"] },
  { title: "Shifts", url: "/erp/shifts", icon: CalendarClock, roles: ["admin", "manager"] },
  { title: "Payroll", url: "/erp/payroll", icon: Wallet, roles: ["admin", "manager"] },
];


function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { role } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const visibleItems = items.filter((item) => item.roles.includes(role));
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url)
                }
              >
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="hover:bg-sidebar-accent/50"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            C
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              Coherence
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <NavGroup label="Overview" items={dashboardItems} />
        <NavGroup label="Operations" items={operationItems} />
        <NavGroup label="Management" items={managementItems} />
        <NavGroup label="ERP" items={erpItems} />
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 text-[10px] text-muted-foreground">
            Coherence v0.1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
