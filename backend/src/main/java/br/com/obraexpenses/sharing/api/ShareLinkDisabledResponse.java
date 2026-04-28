package br.com.obraexpenses.sharing.api;

import java.time.Instant;

public record ShareLinkDisabledResponse(
        boolean active,
        Instant disabledAt) {
}
