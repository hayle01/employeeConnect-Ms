import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryProvider } from "@/app/providers/query-provider";
import { AppRouter } from "@/app/router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
