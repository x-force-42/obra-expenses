package br.com.obraexpenses.auth.api;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserSummaryResponse user,
        CurrentConstructionResponse currentConstruction) {
}
