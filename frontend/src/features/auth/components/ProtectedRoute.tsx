import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthSession } from "@/features/auth/session-context";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isHydrated } = useAuthSession();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <p className="text-center text-sm text-muted-foreground">
          Carregando sessao...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
}
