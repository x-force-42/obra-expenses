import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "@/features/auth";
import { listCategories } from "@/features/categories";
import {
  createExpense,
  listExpenses,
  type ExpenseListItem,
} from "@/features/expenses";
import { listStages } from "@/features/stages";
import { Button } from "@/shared/components/ui/button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatOccurredAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function ExpenseList({ expenses }: { expenses: ExpenseListItem[] }) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border bg-white/70 p-5 text-sm text-muted-foreground">
        Nenhum gasto cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <article
          className="rounded-[24px] border border-border/80 bg-white/80 p-4 shadow-[0_18px_50px_rgba(85,57,16,0.08)]"
          key={expense.id}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                {expense.description || "Gasto sem descricao"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {expense.category.name} · {expense.stage.name}
              </p>
            </div>
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {formatOccurredAt(expense.occurredAt)}
          </p>
        </article>
      ))}
    </div>
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

  const isLoadingPage =
    categoriesQuery.isLoading || stagesQuery.isLoading || expensesQuery.isLoading;
  const pageError =
    categoriesQuery.error || stagesQuery.error || expensesQuery.error;
  const expenses = expensesQuery.data?.content ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 py-10">
      <section className="rounded-[28px] border border-border/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(85,57,16,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {currentConstruction?.name ?? "Minha obra"}
        </p>
        <h1 className="mt-3 text-2xl font-bold">Despesas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registre um gasto rapido e acompanhe os ultimos lancamentos da obra.
        </p>
        {currentConstruction?.currentStage ? (
          <p className="mt-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Etapa atual: {currentConstruction.currentStage.name}
          </p>
        ) : null}
      </section>

      <section className="mt-5 rounded-[28px] border border-border/80 bg-white/80 p-6 shadow-[0_24px_80px_rgba(85,57,16,0.08)]">
        <h2 className="text-lg font-semibold">Novo gasto</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Valor</span>
            <input
              className="w-full rounded-[18px] border border-border bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-muted-foreground"
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
            <span className="mb-2 block text-sm font-medium">Categoria</span>
            <select
              className="w-full rounded-[18px] border border-border bg-white px-4 py-3 text-base outline-none"
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
            <span className="mb-2 block text-sm font-medium">Etapa</span>
            <select
              className="w-full rounded-[18px] border border-border bg-white px-4 py-3 text-base outline-none"
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
            <span className="mb-2 block text-sm font-medium">Descricao</span>
            <textarea
              className="min-h-24 w-full rounded-[18px] border border-border bg-white px-4 py-3 text-base outline-none placeholder:text-muted-foreground"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              value={description}
            />
          </label>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <Button
            className="w-full"
            disabled={createExpenseMutation.isPending || isLoadingPage}
            type="submit"
          >
            {createExpenseMutation.isPending ? "Salvando..." : "Salvar gasto"}
          </Button>
        </form>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ultimos gastos</h2>
          {expensesQuery.data ? (
            <span className="text-sm text-muted-foreground">
              {expensesQuery.data.totalElements} itens
            </span>
          ) : null}
        </div>

        {isLoadingPage ? (
          <div className="rounded-[24px] border border-border/80 bg-white/80 p-5 text-sm text-muted-foreground">
            Carregando despesas...
          </div>
        ) : null}

        {!isLoadingPage && pageError ? (
          <div className="rounded-[24px] border border-border/80 bg-white/80 p-5 text-sm text-destructive">
            {pageError instanceof Error
              ? pageError.message
              : "Nao foi possivel carregar as despesas."}
          </div>
        ) : null}

        {!isLoadingPage && !pageError ? <ExpenseList expenses={expenses} /> : null}
      </section>
    </main>
  );
}
