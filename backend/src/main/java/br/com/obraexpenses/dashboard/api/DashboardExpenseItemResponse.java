package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;
import java.time.Instant;

public record DashboardExpenseItemResponse(
        Long id,
        BigDecimal amount,
        String description,
        String categoryName,
        String stageName,
        Instant occurredAt) {
}
