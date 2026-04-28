package br.com.obraexpenses.auth.api;

import jakarta.validation.constraints.NotBlank;

public record AuthGoogleRequest(
        @NotBlank(message = "Credential is required.")
        String credential) {
}
