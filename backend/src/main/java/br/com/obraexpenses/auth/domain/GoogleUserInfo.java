package br.com.obraexpenses.auth.domain;

public record GoogleUserInfo(
        String googleSubject,
        String name,
        String email,
        String pictureUrl) {
}
