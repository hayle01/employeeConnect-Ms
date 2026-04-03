import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardLayout } from "@/components/layout/dashboard-layout-context";
import { useMediaQuery } from "@/hooks/use-media-query";

const items = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: UsersRound },
  { to: "/users", label: "Users", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } =
    useDashboardLayout();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const showNavText = isMobile || !sidebarCollapsed;

  return (
    <aside
      className={cn(
        "flex h-auto flex-col border-r border-border bg-white transition-[transform,width] duration-200 ease-out",
        "fixed inset-y-0 left-0 z-40 w-[240px] md:static md:z-auto",
        mobileSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0",
        sidebarCollapsed && "md:w-[72px]",
        !sidebarCollapsed && "md:w-[240px]",
      )}>
      <div
        className={cn(
          "flex items-center gap-2 border-b border-transparent px-4 py-5 md:px-3",
          sidebarCollapsed && "md:justify-center md:px-2",
        )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#0099CC]/10">
          <Shield className="h-5 w-5 text-[#0099CC]" />
        </div>
        {showNavText && (
          <span className="truncate text-lg font-semibold tracking-tight text-slate-900">
            EmployeeConnect
          </span>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/overview"}
            onClick={() => isMobile && closeMobileSidebar()}
            title={!showNavText ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                sidebarCollapsed && "md:justify-center md:px-2",
                isActive
                  ? "bg-[#0099CC] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )
            }>
            <Icon className="h-5 w-5 shrink-0" />
            {showNavText && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onLogout}
          title={!showNavText ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            sidebarCollapsed && "md:justify-center md:px-2",
          )}>
          <LogOut className="h-5 w-5 shrink-0" />
          {showNavText && "Logout"}
        </button>
      </div>
    </aside>
  );
}
