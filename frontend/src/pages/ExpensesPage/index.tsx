import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthenticatedShell } from "@/app/AuthenticatedShell";
import { useAuthSession } from "@/features/auth";
import { listCategories } from "@/features/categories";
import {
  createExpense,
  listExpenses,
  type ExpenseListItem,
} from "@/features/expenses";
import { listStages } from "@/features/stages";
import { Button } from "@/shared/components/ui/button";
import {
  Surface,
  SurfaceDescription,
  SurfaceTitle,
} from "@/shared/components/ui/surface";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground";

function ExpenseList({ expenses }: { expenses: ExpenseListItem[] }) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/70 px-5 py-6 text-sm leading-6 text-muted-foreground">
        Nenhum gasto cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <article
          className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4"
          key={expense.id}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {expense.description || "Gasto sem descrição"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {expense.category.name} · {expense.stage.name}
              </p>
            </div>
            <p className="whitespace-nowrap text-sm font-semibold text-foreground">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {formatDate(expense.occurredAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Surface className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </Surface>
  );
}

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const { accessToken, currentConstruction } = useAuthSession();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stageId, setStageId] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories", accessToken],
    queryFn: () => listCategories(accessToken!),
    enabled: Boolean(accessToken),
  });

  const stagesQuery = useQuery({
    queryKey: ["stages", accessToken],
    queryFn: () => listStages(accessToken!),
    enabled: Boolean(accessToken),
  });

  const expensesQuery = useQuery({
    queryKey: ["expenses", accessToken],
    queryFn: () => listExpenses(accessToken!),
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (!categoryId && categoriesQuery.data && categoriesQuery.data.length > 0) {
      setCategoryId(String(categoriesQuery.data[0].id));
    }
  }, [categoryId, categoriesQuery.data]);

  useEffect(() => {
    if (stageId || !stagesQuery.data || stagesQuery.data.length === 0) {
      return;
    }

    const defaultStage =
      stagesQuery.data.find(
        (item) => item.id === currentConstruction?.currentStage?.id,
      ) ?? stagesQuery.data[0];

    setStageId(String(defaultStage.id));
  }, [currentConstruction?.currentStage?.id, stageId, stagesQuery.data]);

  const createExpenseMutation = useMutation({
    mutationFn: (payload: {
      amount: number;
      categoryId: number;
      stageId: number;
      description?: string;
    }) => createExpense(accessToken!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["expenses", accessToken],
      });
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount)) {
      setFormError("Informe um valor valido.");
      return;
    }

    if (numericAmount <= 0) {
      setFormError("O valor deve ser maior que zero.");
      return;
    }

    if (!categoryId || !stageId) {
      setFormError("Selecione categoria e etapa.");
      return;
    }

    setFormError(null);

    try {
      await createExpenseMutation.mutateAsync({
        amount: numericAmount,
        categoryId: Number(categoryId),
        stageId: Number(stageId),
        description: description.trim() || undefined,
      });

      setAmount("");
      setDescription("");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o gasto.",
      );
    }
  }

  const isBootstrappingPage = categoriesQuery.isLoading || stagesQuery.isLoading;
  const isLoadingExpenses = expensesQuery.isLoading;
  const pageError = categoriesQuery.error || stagesQuery.error;
  const expensesError = expensesQuery.error;
  const expenses = expensesQuery.data?.content ?? [];
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <AuthenticatedShell
      eyebrow={currentConstruction?.name ?? "Minha obra"}
      subtitle="Cadastre um gasto sem atrito, mantenha a etapa atual em foco e acompanhe os lançamentos mais recentes da obra."
      title="Despesas"
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total carregado"
          value={formatCurrency(totalSpent)}
        />
        <SummaryCard
          label="Lançamentos"
          value={String(expensesQuery.data?.totalElements ?? expenses.length)}
        />
        <SummaryCard
          label="Etapa atual"
          value={currentConstruction?.currentStage?.name ?? "Sem etapa"}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-28 xl:self-start">
          <Surface className="p-6">
            <SurfaceTitle>Novo gasto</SurfaceTitle>
            <SurfaceDescription className="mt-2">
              Preencha apenas o essencial. A data do lançamento é definida pelo backend.
            </SurfaceDescription>

            {isBootstrappingPage ? (
              <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                Carregando categorias e etapas...
              </div>
            ) : null}

            {!isBootstrappingPage && pageError ? (
              <div className="mt-6 rounded-2xl border border-destructive/20 bg-red-50 px-4 py-4 text-sm text-destructive">
                {pageError instanceof Error
                  ? pageError.message
                  : "Não foi possível carregar os dados do formulário."}
              </div>
            ) : null}

            {!isBootstrappingPage && !pageError ? (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Valor</span>
                  <input
                    className={fieldClassName}
                    inputMode="decimal"
                    min="0.01"
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0,00"
                    step="0.01"
                    type="number"
                    value={amount}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Categoria
                  </span>
                  <select
                    className={fieldClassName}
                    onChange={(event) => setCategoryId(event.target.value)}
                    value={categoryId}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categoriesQuery.data?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">Etapa</span>
                  <select
                    className={fieldClassName}
                    onChange={(event) => setStageId(event.target.value)}
                    value={stageId}
                  >
                    <option value="">Selecione uma etapa</option>
                    {stagesQuery.data?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Descricao
                  </span>
                  <textarea
                    className={`${fieldClassName} min-h-28 resize-none`}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Opcional"
                    value={description}
                  />
                </label>

                {formError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-red-50 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                ) : null}

                <Button
                  className="w-full"
                  disabled={createExpenseMutation.isPending || isBootstrappingPage}
                  size="lg"
                  type="submit"
                >
                  {createExpenseMutation.isPending ? "Salvando..." : "Salvar gasto"}
                </Button>
              </form>
            ) : null}
          </Surface>
        </div>

        <Surface className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SurfaceTitle>Últimos gastos</SurfaceTitle>
              <SurfaceDescription className="mt-2">
                Acompanhe os lançamentos recentes e revise rapidamente categoria,
                etapa e valor.
              </SurfaceDescription>
            </div>
            {expensesQuery.data ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                {expensesQuery.data.totalElements} itens
              </span>
            ) : null}
          </div>

          {isLoadingExpenses ? (
            <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
              Carregando despesas...
            </div>
          ) : null}

          {!isLoadingExpenses && expensesError ? (
            <div className="mt-6 rounded-2xl border border-destructive/20 bg-red-50 px-4 py-4 text-sm text-destructive">
              {expensesError instanceof Error
                ? expensesError.message
                : "Não foi possível carregar as despesas."}
            </div>
          ) : null}

          {!isLoadingExpenses && !expensesError ? (
            <div className="mt-6">
              <ExpenseList expenses={expenses} />
            </div>
          ) : null}
        </Surface>
      </section>
    </AuthenticatedShell>
  );
}
