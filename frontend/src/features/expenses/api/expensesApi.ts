import { fetchApiJson } from "@/shared/lib/api-client";

export type ExpenseReference = {
  id: number;
  name: string;
};

export type ExpenseListItem = {
  id: number;
  amount: number;
  description: string | null;
  category: ExpenseReference;
  stage: ExpenseReference;
  occurredAt: string;
};

export type ExpensePageResponse = {
  content: ExpenseListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CreateExpenseRequest = {
  amount: number;
  categoryId: number;
  stageId: number;
  description?: string;
};

export async function listExpenses(
  accessToken: string,
): Promise<ExpensePageResponse> {
  return fetchApiJson<ExpensePageResponse>("/expenses", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createExpense(
  accessToken: string,
  payload: CreateExpenseRequest,
): Promise<ExpenseListItem> {
  return fetchApiJson<ExpenseListItem>("/expenses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
