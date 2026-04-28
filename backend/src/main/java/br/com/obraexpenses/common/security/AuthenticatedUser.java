package br.com.obraexpenses.common.security;

public record AuthenticatedUser(
        Long userId,
        String email,
        String name) {
}
