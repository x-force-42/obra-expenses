package br.com.obraexpenses.expense.api;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ExpenseCreateRequest(
        @NotNull(message = "Valor e obrigatorio")
        @DecimalMin(value = "0.01", message = "Valor do gasto deve ser maior que zero")
        BigDecimal amount,

        @NotNull(message = "Categoria e obrigatoria")
        Long categoryId,

        @NotNull(message = "Etapa e obrigatoria")
        Long stageId,

        String description) {
}
