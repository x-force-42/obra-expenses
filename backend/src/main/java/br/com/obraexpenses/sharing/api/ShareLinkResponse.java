package br.com.obraexpenses.sharing.api;

import java.time.Instant;

public record ShareLinkResponse(
        boolean active,
        String token,
        String url,
        Instant createdAt,
        Instant disabledAt) {
}
