package br.com.obraexpenses.expense.api;

import java.util.List;

public record ExpensePageResponse(
        List<ExpenseListItemResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {
}
