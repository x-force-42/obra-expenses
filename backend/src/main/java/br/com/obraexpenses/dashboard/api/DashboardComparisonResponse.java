package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;

public record DashboardComparisonResponse(
        BigDecimal currentMonthAmount,
        BigDecimal previousMonthAmount,
        BigDecimal differenceAmount,
        BigDecimal differencePercentage) {
}
