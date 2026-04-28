package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;

public record DashboardMonthlyEvolutionItemResponse(
        String month,
        BigDecimal amount) {
}
