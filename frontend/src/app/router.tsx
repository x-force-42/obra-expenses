import { createBrowserRouter, Navigate } from "react-router-dom";

import { DashboardPage } from "@/pages/DashboardPage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { LoginPage } from "@/pages/LoginPage";
import { PublicDashboardPage } from "@/pages/PublicDashboardPage";

export const router = createBrowserRouter([
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
    element: <DashboardPage />,
  },
  {
    path: "/expenses",
    element: <ExpensesPage />,
  },
  {
    path: "/public/:token",
    element: <PublicDashboardPage />,
  },
]);

