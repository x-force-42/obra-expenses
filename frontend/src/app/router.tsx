import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { LoginPage } from "@/pages/LoginPage";
import { PublicDashboardPage } from "@/pages/PublicDashboardPage";

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/expenses",
      element: (
        <ProtectedRoute>
          <ExpensesPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/public/:token",
      element: <PublicDashboardPage />,
    },
  ]);
}
