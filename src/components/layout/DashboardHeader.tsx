import {
  Bell,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardLayout } from "@/components/layout/dashboard-layout-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const titles: Record<string, { title: string; crumb: string }> = {
  "/overview": { title: "Overview", crumb: "Dashboard" },
  "/employees": { title: "Employees", crumb: "Dashboard" },
  "/users": { title: "Users", crumb: "Dashboard" },
  "/settings": { title: "Settings", crumb: "Dashboard" },
};

export function DashboardHeader() {
  const { pathname } = useLocation();
  const base = "/" + pathname.split("/")[1];
  const meta = titles[base] ?? { title: "Dashboard", crumb: "Dashboard" };
  const { profile, signOut } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useDashboardLayout();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const initial = profile?.username?.[0]?.toUpperCase() ?? "A";
  const roleLabel = profile?.role === "admin" ? "Admin" : "Staff";

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-sm border-border"
          onClick={toggleSidebar}
          aria-label={
            isMdUp
              ? sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
              : "Open menu"
          }>
          {isMdUp ? (
            sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-tight text-slate-900">
            {meta.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {meta.title} /{" "}
            <span className="font-medium text-foreground">{meta.crumb}</span>
          </p>
        </div>
      </div>
      <div className="hidden max-w-md flex-1 justify-center px-4 lg:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-10 rounded-full border-border bg-slate-50 pl-10 pr-4"
            readOnly
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <button
          type="button"
          className="rounded-sm p-2 text-slate-500 hover:bg-slate-50">
          <Bell className="h-5 w-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-sm border border-transparent py-1 pl-1 pr-2 hover:border-border md:gap-3",
              )}>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[#0099CC] text-sm font-semibold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left text-sm sm:block">
                <div className="font-medium text-slate-900">
                  {profile?.username ?? "user"}
                </div>
                <div className="text-xs text-muted-foreground">{roleLabel}</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => void signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
