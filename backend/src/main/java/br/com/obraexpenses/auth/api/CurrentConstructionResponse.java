package br.com.obraexpenses.auth.api;

public record CurrentConstructionResponse(
        Long id,
        String name,
        StageSummaryResponse currentStage) {
}
