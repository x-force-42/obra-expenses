package br.com.obraexpenses.dashboard.api;

import java.math.BigDecimal;

public record DashboardStageItemResponse(
        Long stageId,
        String stageName,
        BigDecimal amount,
        BigDecimal percentage) {
}
