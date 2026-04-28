import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { GoogleLoginButton, useAuthSession } from "@/features/auth";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isHydrated, loginWithGoogleCredential } =
    useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectPath =
    (location.state as LoginLocationState | null)?.from?.pathname ?? "/expenses";

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isHydrated, navigate, redirectPath]);

  async function handleGoogleCredential(credential: string) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await loginWithGoogleCredential(credential);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel autenticar com Google.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <section className="rounded-[28px] border border-border/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(85,57,16,0.08)] backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Obra Expenses
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Controle da sua obra sem planilha.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Entre com sua conta Google para acessar sua obra e continuar de onde
          parou.
        </p>
        <div className="mt-6">
          <GoogleLoginButton
            disabled={isSubmitting}
            onCredential={handleGoogleCredential}
          />
        </div>
        {errorMessage ? (
          <p className="mt-4 text-sm text-destructive">{errorMessage}</p>
        ) : null}
      </section>
    </main>
  );
}
