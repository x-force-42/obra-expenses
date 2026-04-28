package br.com.obraexpenses.construction.api;

import java.time.Instant;

public record ConstructionCurrentResponse(
        Long id,
        String name,
        ConstructionStageResponse currentStage,
        Instant createdAt) {
}
