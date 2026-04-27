package br.com.obraexpenses.auth.api;

public record AuthMeResponse(
        UserSummaryResponse user,
        CurrentConstructionResponse currentConstruction) {
}
