import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import type {
  DashboardBreakdownItem,
  DashboardExpenseItem,
  DashboardPeriod,
  DashboardResponse,
} from "@/features/dashboard/api/dashboardApi";
import {
  Button,
  buttonVariants,
} from "@/shared/components/ui/button";
import {
  Surface,
  SurfaceDescription,
  SurfaceTitle,
} from "@/shared/components/ui/surface";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";
import { cn } from "@/shared/lib/utils";

const PERIOD_OPTIONS: Array<{ label: string; value: DashboardPeriod }> = [
  { label: "Mês", value: "MONTH" },
  { label: "Últimos 30 dias", value: "LAST_30_DAYS" },
  { label: "Tudo", value: "ALL" },
];

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}-01T00:00:00Z`));
}

function formatSignedCurrency(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercentage(value: number) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";

  return `${prefix}${formatter.format(Math.abs(value))}%`;
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
  expense: DashboardExpenseItem;
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
            {expense.categoryName} · {expense.stageName}
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

function HighlightCard({
  emptyLabel,
  item,
  label,
}: {
  emptyLabel: string;
  item: DashboardBreakdownItem | null;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
        {item?.name ?? emptyLabel}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {item
          ? `${formatCurrency(item.amount)} · ${item.percentage.toFixed(2).replace(".", ",")}%`
          : "Nenhum gasto encontrado neste período."}
      </p>
    </div>
  );
}

function BreakdownList({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: Array<{
    amount: number;
    id: number;
    name: string;
    percentage: number;
  }>;
}) {
  const maxAmount = items[0]?.amount ?? 0;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-muted-foreground">
              {formatCurrency(item.amount)} ·{" "}
              {item.percentage.toFixed(2).replace(".", ",")}%
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900"
              style={{
                width: `${
                  maxAmount > 0 ? Math.max((item.amount / maxAmount) * 100, 12) : 0
                }%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonthlyEvolution({
  items,
}: {
  items: Array<{
    amount: number;
    month: string;
  }>;
}) {
  const maxAmount = items.reduce((max, item) => Math.max(max, item.amount), 0);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-6 text-sm text-muted-foreground">
        Nenhum gasto encontrado no período selecionado.
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => (
        <li key={item.month}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="font-medium capitalize text-foreground">
              {formatMonthLabel(item.month)}
            </p>
            <p className="text-muted-foreground">{formatCurrency(item.amount)}</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-primary"
              style={{
                width: `${
                  maxAmount > 0 ? Math.max((item.amount / maxAmount) * 100, 14) : 0
                }%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExpenseList({
  emptyMessage,
  expenses,
  highlightAmount = false,
}: {
  emptyMessage: string;
  expenses: DashboardExpenseItem[];
  highlightAmount?: boolean;
}) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {expenses.map((expense) => (
        <ExpenseLineItem
          expense={expense}
          highlightAmount={highlightAmount}
          key={expense.id}
        />
      ))}
    </ul>
  );
}

export function DashboardPeriodFilter({
  currentPeriod,
  helperText = "O total acumulado sempre considera toda a obra.",
  onChange,
}: {
  currentPeriod: DashboardPeriod;
  helperText?: string;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <section className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Período
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            aria-pressed={currentPeriod === option.value}
            className={cn(
              currentPeriod === option.value &&
                "bg-slate-900 text-white hover:bg-slate-800",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            variant={currentPeriod === option.value ? "secondary" : "outline"}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export function DashboardLoadingState() {
  return (
    <Surface className="px-6 py-8">
      <SurfaceTitle>Carregando visão financeira</SurfaceTitle>
      <SurfaceDescription className="mt-2">
        Estamos consolidando os indicadores principais da obra.
      </SurfaceDescription>
    </Surface>
  );
}

export function DashboardErrorState({ message }: { message: string }) {
  return (
    <Surface className="border-destructive/20 px-6 py-8">
      <SurfaceTitle>Não foi possível carregar o dashboard</SurfaceTitle>
      <SurfaceDescription className="mt-2 text-destructive">
        {message}
      </SurfaceDescription>
    </Surface>
  );
}

export function DashboardEmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Surface className="p-6 sm:p-8">
      <SurfaceTitle>{title}</SurfaceTitle>
      <SurfaceDescription className="mt-3 max-w-2xl">
        {description}
      </SurfaceDescription>
      {action ? <div className="mt-6">{action}</div> : null}
    </Surface>
  );
}

export function DashboardInsights({
  dashboard,
  detailsLinkHref,
  selectedPeriod,
}: {
  dashboard: DashboardResponse;
  detailsLinkHref?: string;
  selectedPeriod: DashboardPeriod;
}) {
  const comparison = dashboard.currentVsPreviousMonth;
  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === selectedPeriod)?.label.toLowerCase() ??
    "mês";
  const comparisonToneClassName =
    comparison.differenceAmount < 0
      ? "text-emerald-700"
      : comparison.differenceAmount > 0
        ? "text-amber-700"
        : "text-foreground";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          helper="Mês corrente da obra, independente do filtro selecionado."
          label="Gasto no mês"
          value={formatCurrency(dashboard.monthSpent)}
        />
        <MetricCard
          helper="Sempre considera todo o histórico da construção."
          label="Total acumulado"
          value={formatCurrency(dashboard.totalSpent)}
        />
        <MetricCard
          helper={`Média dos lançamentos em ${periodLabel}.`}
          label="Ticket médio"
          value={formatCurrency(dashboard.averageTicket)}
        />
        <MetricCard
          helper={`Atual: ${formatCurrency(
            comparison.currentMonthAmount,
          )} · Anterior: ${formatCurrency(comparison.previousMonthAmount)}`}
          label="Comparação mensal"
          value={formatSignedCurrency(comparison.differenceAmount)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Surface className="p-6">
          <SurfaceTitle>Distribuição por categoria</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Veja rapidamente onde o dinheiro está concentrado.
          </SurfaceDescription>

          <BreakdownList
            emptyMessage="Nenhum gasto encontrado no período selecionado."
            items={dashboard.byCategory.map((item) => ({
              amount: item.amount,
              id: item.categoryId,
              name: item.categoryName,
              percentage: item.percentage,
            }))}
          />
        </Surface>

        <Surface className="p-6">
          <SurfaceTitle>Distribuição por etapa</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Acompanhe quais frentes da obra estão puxando o custo agora.
          </SurfaceDescription>

          <BreakdownList
            emptyMessage="Nenhum gasto encontrado no período selecionado."
            items={dashboard.byStage.map((item) => ({
              amount: item.amount,
              id: item.stageId,
              name: item.stageName,
              percentage: item.percentage,
            }))}
          />
        </Surface>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Surface className="p-6">
          <SurfaceTitle>Leituras rápidas</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Resumo do que merece atenção imediata no período atual.
          </SurfaceDescription>

          <div className="mt-6 grid gap-4">
            <HighlightCard
              emptyLabel="Sem categoria dominante"
              item={dashboard.mainCategory}
              label="Categoria principal"
            />
            <HighlightCard
              emptyLabel="Sem etapa dominante"
              item={dashboard.mainStage}
              label="Etapa principal"
            />
            <div className="rounded-2xl border border-border/70 bg-background/70 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Mês atual vs anterior
              </p>
              <p
                className={cn(
                  "mt-3 text-lg font-semibold tracking-tight",
                  comparisonToneClassName,
                )}
              >
                {formatSignedPercentage(comparison.differencePercentage)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Diferença de {formatSignedCurrency(comparison.differenceAmount)}{" "}
                entre os dois meses.
              </p>
            </div>
          </div>
        </Surface>

        <Surface className="p-6">
          <SurfaceTitle>Evolução mensal</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Leitura rápida da progressão dos gastos ao longo do tempo.
          </SurfaceDescription>

          <MonthlyEvolution items={dashboard.monthlyEvolution} />
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
            {detailsLinkHref ? (
              <Link
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "shrink-0",
                )}
                to={detailsLinkHref}
              >
                Ver página completa
              </Link>
            ) : null}
          </div>

          <ExpenseList
            emptyMessage="Nenhum gasto encontrado no período selecionado."
            expenses={dashboard.latestExpenses}
          />
        </Surface>

        <Surface className="p-6">
          <SurfaceTitle>Maiores gastos</SurfaceTitle>
          <SurfaceDescription className="mt-2">
            Os itens que mais pesaram no período selecionado.
          </SurfaceDescription>

          <ExpenseList
            emptyMessage="Nenhum gasto encontrado no período selecionado."
            expenses={dashboard.topExpenses}
            highlightAmount
          />
        </Surface>
      </section>
    </div>
  );
}
