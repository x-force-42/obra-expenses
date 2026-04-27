package br.com.obraexpenses.auth.api;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String pictureUrl) {
}
