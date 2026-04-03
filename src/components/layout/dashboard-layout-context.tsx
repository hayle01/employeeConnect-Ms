import { createContext, useCallback, useContext, useMemo, useState } from "react";

type DashboardLayoutContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  closeMobileSidebar: () => void;
};

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);

export function DashboardLayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    const isMdUp = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    if (isMdUp) {
      setSidebarCollapsed((c) => !c);
    } else {
      setMobileSidebarOpen((o) => !o);
    }
  }, []);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      closeMobileSidebar,
    }),
    [sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar],
  );

  return <DashboardLayoutContext.Provider value={value}>{children}</DashboardLayoutContext.Provider>;
}

export function useDashboardLayout() {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx) throw new Error("useDashboardLayout must be used within DashboardLayoutProvider");
  return ctx;
}
