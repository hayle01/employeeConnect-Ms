import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { AdminRoute, ProtectedRoute } from "@/app/router/ProtectedRoute";
import { LoginPage } from "@/app/pages/auth/LoginPage";
import { OverviewPage } from "@/app/pages/dashboard/OverviewPage";
import { EmployeesPage } from "@/app/pages/employees/EmployeesPage";
import { EmployeeNewPage } from "@/app/pages/employees/EmployeeNewPage";
import { EmployeeDetailPage } from "@/app/pages/employees/EmployeeDetailPage";
import { EmployeeEditPage } from "@/app/pages/employees/EmployeeEditPage";
import { EmployeeRenewPage } from "@/app/pages/employees/EmployeeRenewPage";
import { UsersPage } from "@/app/pages/users/UsersPage";
import { SettingsPage } from "@/app/pages/settings/SettingsPage";
import { PublicEmployeePage } from "@/app/pages/public/PublicEmployeePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee-public/:slug" element={<PublicEmployeePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<EmployeeNewPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
            <Route path="/employees/:id/renew" element={<EmployeeRenewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
