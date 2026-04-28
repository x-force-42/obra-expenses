package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;

public record DashboardBreakdownItemResponse(
        Long id,
        String name,
        BigDecimal amount,
        BigDecimal percentage) {
}
