import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { GoogleLoginButton, useAuthSession } from "@/features/auth";
import { Surface, SurfaceDescription, SurfaceTitle } from "@/shared/components/ui/surface";

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
    (location.state as LoginLocationState | null)?.from?.pathname ?? "/dashboard";

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)] lg:items-center">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Obra Expenses
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Controle da sua obra sem planilha.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Visualize seus gastos com clareza, registre despesas em poucos toques
            e acompanhe o que merece atenção sem depender de controles espalhados.
          </p>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-white/75 px-4 py-4">
              <dt className="text-sm font-medium text-foreground">Cadastro rápido</dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                Lance um gasto sem formulário pesado.
              </dd>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/75 px-4 py-4">
              <dt className="text-sm font-medium text-foreground">Leitura clara</dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                Entenda total, categorias e lançamentos recentes.
              </dd>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/75 px-4 py-4">
              <dt className="text-sm font-medium text-foreground">Sessão segura</dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                Entre com Google e continue de onde parou.
              </dd>
            </div>
          </dl>
        </section>

        <Surface className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Acesso
          </p>
          <SurfaceTitle className="mt-3 text-2xl sm:text-[2rem]">
            Entrar na sua área financeira
          </SurfaceTitle>
          <SurfaceDescription className="mt-3">
            Use sua conta Google para abrir o dashboard, revisar o andamento da
            obra e registrar novos gastos com rapidez.
          </SurfaceDescription>

          <div className="mt-8">
            <GoogleLoginButton
              disabled={isSubmitting}
              onCredential={handleGoogleCredential}
            />
          </div>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Ao continuar, sua sessão da aplicação será criada para a obra atual.
          </p>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-destructive/20 bg-red-50 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </Surface>
      </div>
    </main>
  );
}
