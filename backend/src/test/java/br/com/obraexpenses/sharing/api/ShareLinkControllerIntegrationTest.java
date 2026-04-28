package br.com.obraexpenses.sharing.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import br.com.obraexpenses.auth.api.AuthGoogleRequest;
import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
import br.com.obraexpenses.sharing.domain.ShareLinkRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
@Transactional
class ShareLinkControllerIntegrationTest {

    private static final String API_CONTEXT_PATH = "/api";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("obra_expenses_test")
            .withUsername("app")
            .withPassword("app");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("SPRING_DATASOURCE_URL", postgres::getJdbcUrl);
        registry.add("SPRING_DATASOURCE_USERNAME", postgres::getUsername);
        registry.add("SPRING_DATASOURCE_PASSWORD", postgres::getPassword);
        registry.add("app.security.jwt-secret", () -> "test-jwt-secret");
        registry.add("app.auth.google-client-id", () -> "test-google-client-id");
        registry.add("app.sharing.public-base-url", () -> "http://localhost:5173");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ShareLinkRepository shareLinkRepository;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @MockBean
    private Clock clock;

    @Test
    void returnsInactiveStateWhenShareLinkDoesNotExist() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-05-01T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();

        mockMvc.perform(apiGet("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.url").doesNotExist())
                .andExpect(jsonPath("$.createdAt").doesNotExist())
                .andExpect(jsonPath("$.disabledAt").doesNotExist());
    }

    @Test
    void createsAndDisablesShareLink() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-05-01T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();

        String createResponse = mockMvc.perform(apiPost("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.startsWith("http://localhost:5173/public/dashboard/")))
                .andExpect(jsonPath("$.createdAt").isString())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String createdToken = objectMapper.readTree(createResponse).get("token").asText();
        assertThat(shareLinkRepository.findByTokenAndActiveTrue(createdToken)).isPresent();

        mockMvc.perform(apiDelete("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.disabledAt").value("2026-05-01T10:00:00Z"));

        mockMvc.perform(apiGet("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void regeneratesShareLinkWithNewToken() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-05-01T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();

        String createResponse = mockMvc.perform(apiPost("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String originalToken = objectMapper.readTree(createResponse).get("token").asText();

        String regenerateResponse = mockMvc.perform(apiPost("/share-link/regenerate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.regeneratedAt").value("2026-05-01T10:00:00Z"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String regeneratedToken = objectMapper.readTree(regenerateResponse).get("token").asText();

        assertThat(regeneratedToken).isNotEqualTo(originalToken);
        assertThat(shareLinkRepository.findByTokenAndActiveTrue(originalToken)).isEmpty();
        assertThat(shareLinkRepository.findByTokenAndActiveTrue(regeneratedToken)).isPresent();
    }

    private String authenticate() throws Exception {
        when(googleTokenVerifier.verify("valid-google-token"))
                .thenReturn(new GoogleUserInfo(
                        "google-subject-1",
                        "Eliezer Alves",
                        "eliezer@email.com",
                        "https://example.com/avatar.jpg"));

        String response = mockMvc.perform(apiPost("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthGoogleRequest("valid-google-token"))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("accessToken").asText();
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiPost(String path) {
        return post(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiGet(String path) {
        return get(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiDelete(String path) {
        return delete(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }
}
