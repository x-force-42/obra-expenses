import { fetchApiJson } from "@/shared/lib/api-client";

export type DashboardPeriod = "MONTH" | "LAST_30_DAYS" | "ALL";

export type DashboardBreakdownItem = {
  id: number;
  name: string;
  amount: number;
  percentage: number;
};

export type DashboardCategoryItem = {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
};

export type DashboardStageItem = {
  stageId: number;
  stageName: string;
  amount: number;
  percentage: number;
};

export type DashboardMonthlyEvolutionItem = {
  month: string;
  amount: number;
};

export type DashboardExpenseItem = {
  id: number;
  amount: number;
  description: string | null;
  categoryName: string;
  stageName: string;
  occurredAt: string;
};

export type DashboardComparison = {
  currentMonthAmount: number;
  previousMonthAmount: number;
  differenceAmount: number;
  differencePercentage: number;
};

export type DashboardResponse = {
  period: DashboardPeriod;
  monthSpent: number;
  totalSpent: number;
  averageTicket: number;
  mainCategory: DashboardBreakdownItem | null;
  mainStage: DashboardBreakdownItem | null;
  currentVsPreviousMonth: DashboardComparison;
  byCategory: DashboardCategoryItem[];
  byStage: DashboardStageItem[];
  monthlyEvolution: DashboardMonthlyEvolutionItem[];
  latestExpenses: DashboardExpenseItem[];
  topExpenses: DashboardExpenseItem[];
};

export async function getDashboard(
  accessToken: string,
  period: DashboardPeriod = "MONTH",
): Promise<DashboardResponse> {
  const params = new URLSearchParams({ period });

  return fetchApiJson<DashboardResponse>(`/dashboard?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
