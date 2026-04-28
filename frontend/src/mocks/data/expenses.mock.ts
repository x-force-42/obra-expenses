import type { ExpenseListItem } from "@/features/expenses";

const initialExpenses: ExpenseListItem[] = [
  {
    id: 1,
    amount: 330,
    description: "Locação container",
    category: {
      id: 1,
      name: "Material",
    },
    stage: {
      id: 1,
      name: "Fundação",
    },
    occurredAt: "2026-04-25T18:30:00Z",
  },
];

let expenseStore = [...initialExpenses];
let nextExpenseId = initialExpenses.length + 1;

export function listMockExpenses() {
  return [...expenseStore];
}

export function addMockExpense(
  expense: Omit<ExpenseListItem, "id" | "occurredAt">,
): ExpenseListItem {
  const createdExpense: ExpenseListItem = {
    id: nextExpenseId,
    occurredAt: new Date("2026-04-26T10:00:00Z").toISOString(),
    ...expense,
  };

  expenseStore = [createdExpense, ...expenseStore];
  nextExpenseId += 1;
  return createdExpense;
}

export function resetMockExpenses() {
  expenseStore = [...initialExpenses];
  nextExpenseId = initialExpenses.length + 1;
}
