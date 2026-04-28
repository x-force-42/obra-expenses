import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthSession } from "@/features/auth/session-context";

import { Surface } from "@/shared/components/ui/surface";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isHydrated } = useAuthSession();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <Surface className="px-6 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Carregando sessão...</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos restaurando o acesso da sua obra.
          </p>
        </Surface>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
}
