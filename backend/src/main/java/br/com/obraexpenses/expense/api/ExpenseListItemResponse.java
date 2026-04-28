package br.com.obraexpenses.expense.api;

import java.math.BigDecimal;
import java.time.Instant;

public record ExpenseListItemResponse(
        Long id,
        BigDecimal amount,
        String description,
        ExpenseCategoryResponse category,
        ExpenseStageResponse stage,
        Instant occurredAt) {
}
