import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { AuthenticatedShell } from "@/app/AuthenticatedShell";
import { useAuthSession } from "@/features/auth";
import { listExpenses, type ExpenseListItem } from "@/features/expenses";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Surface,
  SurfaceDescription,
  SurfaceTitle,
} from "@/shared/components/ui/surface";
import {
  formatCurrency,
  formatDate,
  formatDayAndMonth,
} from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

function getExpensesByDate(expenses: ExpenseListItem[]) {
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    const key = expense.occurredAt.slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
  });

  return [...totals.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, amount]) => ({ amount, date }))
    .slice(-5);
}

function getExpensesByCategory(expenses: ExpenseListItem[]) {
  const totals = new Map<string, number>();

  expenses.forEach((expense) => {
    const key = expense.category.name;
    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
  });

  return [...totals.entries()]
    .map(([category, amount]) => ({ amount, category }))
    .sort((first, second) => second.amount - first.amount);
}

function MetricCard({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <Surface className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
    </Surface>
  );
}

function ExpenseLineItem({
  expense,
  highlightAmount = false,
}: {
  expense: ExpenseListItem;
  highlightAmount?: boolean;
}) {
  return (
    <li className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {expense.description || "Gasto sem descrição"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {expense.category.name} · {expense.stage.name}
          </p>
        </div>
        <p
          className={cn(
            "whitespace-nowrap text-sm font-semibold text-foreground",
            highlightAmount && "text-primary",
          )}
        >
          {formatCurrency(expense.amount)}
        </p>
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {formatDate(expense.occurredAt)}
      </p>
    </li>
  );
}

export function DashboardPage() {
  const { accessToken, currentConstruction } = useAuthSession();

  const expensesQuery = useQuery({
    queryKey: ["expenses", accessToken],
    queryFn: () => listExpenses(accessToken!),
    enabled: Boolean(accessToken),
  });

  const expenses = [...(expensesQuery.data?.content ?? [])].sort(
    (first, second) =>
      new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime(),
  );
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageSpent = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const currentStageTotal = expenses.reduce(
    (sum, expense) =>
      expense.stage.name === currentConstruction?.currentStage?.name
        ? sum + expense.amount
        : sum,
    0,
  );
  const categoryTotals = getExpensesByCategory(expenses);
  const dailyTotals = getExpensesByDate(expenses);
  const topCategory = categoryTotals[0];
  const topExpenses = [...expenses]
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 3);
  const recentExpenses = expenses.slice(0, 5);
  const maxCategoryTotal = categoryTotals[0]?.amount ?? 0;
  const maxDailyTotal = dailyTotals.reduce(
    (max, item) => Math.max(max, item.amount),
    0,
  );
  const isPartialData =
    (expensesQuery.data?.totalElements ?? expenses.length) > expenses.length;

  return (
    <AuthenticatedShell
      actions={
        <Link className={buttonVariants({ variant: "secondary" })} to="/expenses">
          Novo gasto
        </Link>
      }
      eyebrow="Visão geral"
      subtitle="Veja os números principais primeiro, entenda a concentração dos gastos e desça para os detalhes só quando precisar."
      title="Dashboard"
    >
      {expensesQuery.isLoading ? (
        <Surface className="px-6 py-8">
          <SurfaceTitle>Carregando visão financeira</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Estamos reunindo os lançamentos mais recentes da obra.
          </SurfaceDescription>
        </Surface>
      ) : null}

      {!expensesQuery.isLoading && expensesQuery.error ? (
        <Surface className="border-destructive/20 px-6 py-8">
          <SurfaceTitle>Não foi possível carregar o dashboard</SurfaceTitle>
          <SurfaceDescription className="mt-2 text-destructive">
            {expensesQuery.error instanceof Error
              ? expensesQuery.error.message
              : "Tente novamente em instantes."}
          </SurfaceDescription>
        </Surface>
      ) : null}

      {!expensesQuery.isLoading && !expensesQuery.error && expenses.length === 0 ? (
        <Surface className="p-6 sm:p-8">
          <SurfaceTitle>Seu dashboard começa com o primeiro lançamento</SurfaceTitle>
          <SurfaceDescription className="mt-3 max-w-2xl">
            Ainda não há despesas registradas. Assim que o primeiro gasto entrar,
            esta tela passa a destacar total investido, categorias que mais pesam
            e lançamentos que exigem atenção.
          </SurfaceDescription>
          <div className="mt-6">
            <Link className={buttonVariants({ variant: "secondary" })} to="/expenses">
              Cadastrar primeiro gasto
            </Link>
          </div>
        </Surface>
      ) : null}

      {!expensesQuery.isLoading && !expensesQuery.error && expenses.length > 0 ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              helper={`${expenses.length} lançamento${expenses.length > 1 ? "s" : ""} na visão atual`}
              label="Total lançado"
              value={formatCurrency(totalSpent)}
            />
            <MetricCard
              helper={
                topCategory
                  ? `${topCategory.category} concentra a maior fatia`
                  : "Sem categoria dominante ainda"
              }
              label="Ticket médio"
              value={formatCurrency(averageSpent)}
            />
            <MetricCard
              helper={
                currentConstruction?.currentStage?.name
                  ? `Etapa atual: ${currentConstruction.currentStage.name}`
                  : "Sem etapa atual definida"
              }
              label="Etapa atual"
              value={formatCurrency(currentStageTotal)}
            />
            <MetricCard
              helper={
                expenses[0]
                  ? `Último lançamento em ${formatDate(expenses[0].occurredAt)}`
                  : "Sem lançamentos recentes"
              }
              label="Maior gasto"
              value={formatCurrency(topExpenses[0]?.amount ?? 0)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
            <Surface className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SurfaceTitle>Distribuição por categoria</SurfaceTitle>
                  <SurfaceDescription className="mt-2">
                    Identifique rapidamente para onde o dinheiro está indo.
                  </SurfaceDescription>
                </div>
                {isPartialData ? (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Baseado nos lançamentos carregados
                  </span>
                ) : null}
              </div>

              <ul className="mt-6 space-y-4">
                {categoryTotals.map((item) => {
                  const percentage =
                    totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;

                  return (
                    <li key={item.category}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="font-medium text-foreground">{item.category}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(item.amount)} · {percentage}%
                        </p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-slate-900"
                          style={{
                            width: `${
                              maxCategoryTotal > 0
                                ? Math.max((item.amount / maxCategoryTotal) * 100, 12)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Surface>

            <Surface className="p-6">
              <SurfaceTitle>Evolução recente</SurfaceTitle>
              <SurfaceDescription className="mt-2">
                Leitura rápida dos lançamentos mais recentes no tempo.
              </SurfaceDescription>

              <ul className="mt-6 space-y-4">
                {dailyTotals.map((item) => (
                  <li key={item.date}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <p className="font-medium text-foreground">
                        {formatDayAndMonth(item.date)}
                      </p>
                      <p className="text-muted-foreground">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${
                            maxDailyTotal > 0
                              ? Math.max((item.amount / maxDailyTotal) * 100, 14)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Surface>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Surface className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SurfaceTitle>Últimos lançamentos</SurfaceTitle>
                  <SurfaceDescription className="mt-2">
                    Os registros mais recentes para revisão rápida.
                  </SurfaceDescription>
                </div>
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "shrink-0",
                  )}
                  to="/expenses"
                >
                  Ver página completa
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                {recentExpenses.map((expense) => (
                  <ExpenseLineItem expense={expense} key={expense.id} />
                ))}
              </ul>
            </Surface>

            <Surface className="p-6">
              <SurfaceTitle>Maiores gastos</SurfaceTitle>
              <SurfaceDescription className="mt-2">
                Os itens que mais pesaram na obra até aqui.
              </SurfaceDescription>

              <ul className="mt-6 space-y-3">
                {topExpenses.map((expense) => (
                  <ExpenseLineItem
                    expense={expense}
                    highlightAmount
                    key={expense.id}
                  />
                ))}
              </ul>
            </Surface>
          </section>
        </div>
      ) : null}
    </AuthenticatedShell>
  );
}
