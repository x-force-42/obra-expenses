import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardInsights,
  DashboardLoadingState,
  DashboardPeriodFilter,
  getPublicDashboard,
  type DashboardPeriod,
} from "@/features/dashboard";
import { Surface, SurfaceDescription, SurfaceTitle } from "@/shared/components/ui/surface";

export function PublicDashboardPage() {
  const { token } = useParams<{ token: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("ALL");

  const dashboardQuery = useQuery({
    queryKey: ["public-dashboard", token, selectedPeriod],
    queryFn: () => getPublicDashboard(token!, selectedPeriod),
    enabled: Boolean(token),
  });

  const dashboard = dashboardQuery.data;
  const hasExpenses = (dashboard?.totalSpent ?? 0) > 0;

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Compartilhamento público
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Dashboard público
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Esta visualização é somente leitura. Ela mostra os indicadores da obra
            sem permitir cadastro, edição ou exclusão de dados.
          </p>
        </div>

        <Surface className="mb-6 border-border/70 bg-background/80 p-4 sm:mb-8">
          <SurfaceTitle className="text-base">Modo read-only</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            O período público abre por padrão em tudo, mas você ainda pode ajustar
            a leitura para comparar recortes menores.
          </SurfaceDescription>
        </Surface>

        <DashboardPeriodFilter
          currentPeriod={selectedPeriod}
          helperText="Sem login, sem ações de edição e com o mesmo resumo financeiro compartilhado pelo proprietário."
          onChange={setSelectedPeriod}
        />

        {dashboardQuery.isLoading ? <DashboardLoadingState /> : null}

        {!dashboardQuery.isLoading && dashboardQuery.error ? (
          <DashboardErrorState
            message={
              dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : "Não foi possível carregar o dashboard público."
            }
          />
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.error && !hasExpenses ? (
          <DashboardEmptyState
            description="Este link está ativo, mas ainda não há gastos suficientes para montar a visão financeira compartilhada."
            title="Ainda não há dados para exibir"
          />
        ) : null}

        {!dashboardQuery.isLoading && !dashboardQuery.error && dashboard ? (
          <DashboardInsights dashboard={dashboard} selectedPeriod={selectedPeriod} />
        ) : null}
      </div>
    </main>
  );
}
