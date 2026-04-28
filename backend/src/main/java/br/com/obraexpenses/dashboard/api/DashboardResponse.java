package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        DashboardPeriod period,
        BigDecimal monthSpent,
        BigDecimal totalSpent,
        BigDecimal averageTicket,
        DashboardBreakdownItemResponse mainCategory,
        DashboardBreakdownItemResponse mainStage,
        DashboardComparisonResponse currentVsPreviousMonth,
        List<DashboardCategoryItemResponse> byCategory,
        List<DashboardStageItemResponse> byStage,
        List<DashboardMonthlyEvolutionItemResponse> monthlyEvolution,
        List<DashboardExpenseItemResponse> latestExpenses,
        List<DashboardExpenseItemResponse> topExpenses) {
}
