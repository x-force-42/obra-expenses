package br.com.obraexpenses.category.api;

public record CategoryResponse(
        Long id,
        String name,
        boolean isDefault,
        boolean active) {
}
