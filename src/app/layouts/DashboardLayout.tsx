import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardLayoutProvider, useDashboardLayout } from "@/components/layout/dashboard-layout-context";
import { useAuth } from "@/hooks/use-auth";

function DashboardShell() {
  const { signOut } = useAuth();
  const { mobileSidebarOpen, closeMobileSidebar } = useDashboardLayout();

  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={closeMobileSidebar}
        />
      )}
      <Sidebar onLogout={() => void signOut()} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <DashboardLayoutProvider>
      <DashboardShell />
    </DashboardLayoutProvider>
  );
}
