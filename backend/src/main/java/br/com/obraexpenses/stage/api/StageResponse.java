package br.com.obraexpenses.stage.api;

public record StageResponse(
        Long id,
        String name,
        boolean isDefault,
        boolean active) {
}
