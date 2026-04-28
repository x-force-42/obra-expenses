package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;

public record DashboardCategoryItemResponse(
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        BigDecimal percentage) {
}
