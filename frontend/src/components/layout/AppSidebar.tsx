import {
  ShoppingCart, ChefHat, Package, ClipboardList, Users, BarChart3, Store, ClipboardCheck,
  LayoutDashboard, UserCog, CalendarCheck, CalendarClock, Wallet, UtensilsCrossed, UsersRound
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AppRole } from "@/config/types/role";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: AppRole[];
}

const dashboardItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["Owner", "Manager"] },
];

const operationItems: NavItem[] = [
  { title: "Point of Sale", url: "/pos/tables", icon: ShoppingCart, roles: ["Owner", "Manager", "Waiter"] },
  { title: "Kitchen Display", url: "/kitchen", icon: ChefHat, roles: ["Owner", "Manager", "Chef"] },
];

const managementItems: NavItem[] = [
  { title: "Inventory", url: "/inventory", icon: Package, roles: ["Owner", "Manager", "Inventory Manager"] },
  { title: "Purchase Orders", url: "/purchase-orders", icon: ClipboardList, roles: ["Owner", "Manager", "Inventory Manager"] },
  { title: "CRM", url: "/crm", icon: Users, roles: ["Owner", "Manager"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["Owner", "Manager"] },
  { title: "Vendors", url: "/vendors", icon: Store, roles: ["Owner", "Manager", "Inventory Manager"] },
  { title: "Menu Items", url: "/menu", icon: UtensilsCrossed, roles: ["Owner", "Manager"] },
];

const erpItems: NavItem[] = [
  { title: "Daily Roster", url: "/workforce-roster", icon: ClipboardCheck, roles: ["Owner", "Manager"] },
  { title: "Payroll", url: "/erp/payroll", icon: Wallet, roles: ["Owner", "Manager"] },
  { title: "Employees", url: "/settings/employees", icon: UsersRound, roles: ["Owner", "Manager"] },
];

// const systemItems: NavItem[] = [
//   { title: "Settings", url: "/settings", icon: Settings, roles: ["Owner"] },
//   { title: "Roles", url: "/settings/roles", icon: Shield, roles: ["Owner"] },
//   { title: "Employees", url: "/settings/employees", icon: UsersRound, roles: ["Owner"] },
// ];

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
                  className="transition-all duration-200 hover:bg-sidebar-accent/50 hover:pl-3"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm ring-1 ring-border/50"
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
        <NavGroup label="Workforce" items={erpItems} />
        {/* <NavGroup label="System" items={systemItems} /> */}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 text-[10px] text-muted-foreground">Coherence v0.1.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
