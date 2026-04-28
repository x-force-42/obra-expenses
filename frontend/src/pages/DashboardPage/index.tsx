import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { AuthenticatedShell } from "@/app/AuthenticatedShell";
import { useAuthSession } from "@/features/auth";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardInsights,
  DashboardLoadingState,
  DashboardPeriodFilter,
  getDashboard,
  type DashboardPeriod,
} from "@/features/dashboard";
import { ShareLinkCard } from "@/features/sharing";
import { buttonVariants } from "@/shared/components/ui/button";

export function DashboardPage() {
  const { accessToken } = useAuthSession();
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("MONTH");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", accessToken, selectedPeriod],
    queryFn: () => getDashboard(accessToken!, selectedPeriod),
    enabled: Boolean(accessToken),
  });

  const dashboard = dashboardQuery.data;
  const hasExpenses = (dashboard?.totalSpent ?? 0) > 0;

  return (
    <AuthenticatedShell
      actions={
        <Link className={buttonVariants({ variant: "secondary" })} to="/expenses">
          Novo gasto
        </Link>
      }
      eyebrow="Visão geral"
      subtitle="Comece pelos números principais, refine o período quando precisar e desça para os detalhes só depois."
      title="Dashboard"
    >
      <DashboardPeriodFilter
        currentPeriod={selectedPeriod}
        onChange={setSelectedPeriod}
      />

      <ShareLinkCard />

      {dashboardQuery.isLoading ? <DashboardLoadingState /> : null}

      {!dashboardQuery.isLoading && dashboardQuery.error ? (
        <DashboardErrorState
          message={
            dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : "Tente novamente em instantes."
          }
        />
      ) : null}

      {!dashboardQuery.isLoading && !dashboardQuery.error && !hasExpenses ? (
        <DashboardEmptyState
          action={
            <Link className={buttonVariants({ variant: "secondary" })} to="/expenses">
              Cadastrar primeiro gasto
            </Link>
          }
          description="Ainda não há despesas registradas. Assim que o primeiro gasto entrar, esta tela passa a destacar total investido, concentração por categoria, evolução mensal e lançamentos que exigem atenção."
          title="Seu dashboard começa com o primeiro lançamento"
        />
      ) : null}

      {!dashboardQuery.isLoading && !dashboardQuery.error && dashboard ? (
        <DashboardInsights
          dashboard={dashboard}
          detailsLinkHref="/expenses"
          selectedPeriod={selectedPeriod}
        />
      ) : null}
    </AuthenticatedShell>
  );
}
