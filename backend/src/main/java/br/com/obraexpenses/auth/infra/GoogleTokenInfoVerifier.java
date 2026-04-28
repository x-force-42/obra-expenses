package br.com.obraexpenses.auth.infra;

import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
import br.com.obraexpenses.auth.domain.InvalidGoogleCredentialException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class GoogleTokenInfoVerifier implements GoogleTokenVerifier {

    private final RestClient restClient;
    private final String googleClientId;

    public GoogleTokenInfoVerifier(@Value("${app.auth.google-client-id}") String googleClientId) {
        this.restClient = RestClient.builder()
                .baseUrl("https://oauth2.googleapis.com")
                .build();
        this.googleClientId = googleClientId;
    }

    @Override
    public GoogleUserInfo verify(String credential) {
        if (!StringUtils.hasText(credential)) {
            throw new InvalidGoogleCredentialException("Google credential is required.");
        }

        try {
            GoogleTokenInfoResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", credential)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(GoogleTokenInfoResponse.class);

            if (response == null
                    || !StringUtils.hasText(response.sub())
                    || !StringUtils.hasText(response.email())
                    || !StringUtils.hasText(response.name())
                    || !googleClientId.equals(response.aud())) {
                throw new InvalidGoogleCredentialException("Google credential is invalid.");
            }

            return new GoogleUserInfo(
                    response.sub(),
                    response.name(),
                    response.email(),
                    response.picture());
        } catch (RestClientException exception) {
            throw new InvalidGoogleCredentialException("Google credential is invalid.");
        }
    }

    private record GoogleTokenInfoResponse(
            String aud,
            String sub,
            String email,
            String name,
            String picture) {
    }
}
