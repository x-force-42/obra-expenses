package br.com.obraexpenses.auth.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
import br.com.obraexpenses.auth.domain.InvalidGoogleCredentialException;
import br.com.obraexpenses.category.domain.CategoryRepository;
import br.com.obraexpenses.construction.domain.ConstructionRepository;
import br.com.obraexpenses.stage.domain.StageRepository;
import br.com.obraexpenses.user.domain.UserRepository;
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
class AuthControllerIntegrationTest {

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
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConstructionRepository constructionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StageRepository stageRepository;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @Test
    void authenticatesFirstLoginAndBootstrapsDefaultData() throws Exception {
        when(googleTokenVerifier.verify("valid-google-token"))
                .thenReturn(new GoogleUserInfo(
                        "google-subject-1",
                        "Eliezer Alves",
                        "eliezer@email.com",
                        "https://example.com/avatar.jpg"));

        mockMvc.perform(apiPost("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthGoogleRequest("valid-google-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.name").value("Eliezer Alves"))
                .andExpect(jsonPath("$.currentConstruction.name").value("Minha obra"))
                .andExpect(jsonPath("$.currentConstruction.currentStage.name").value("Fundação"));

        org.assertj.core.api.Assertions.assertThat(userRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(constructionRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(categoryRepository.count()).isEqualTo(5);
        org.assertj.core.api.Assertions.assertThat(stageRepository.count()).isEqualTo(11);
    }

    @Test
    void reusesExistingUserAndDoesNotDuplicateBootstrapData() throws Exception {
        when(googleTokenVerifier.verify("valid-google-token"))
                .thenReturn(new GoogleUserInfo(
                        "google-subject-1",
                        "Eliezer Alves",
                        "eliezer@email.com",
                        "https://example.com/avatar.jpg"));

        String payload = objectMapper.writeValueAsString(new AuthGoogleRequest("valid-google-token"));

        mockMvc.perform(apiPost("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(apiPost("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentConstruction.name").value("Minha obra"));

        org.assertj.core.api.Assertions.assertThat(userRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(constructionRepository.count()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(categoryRepository.count()).isEqualTo(5);
        org.assertj.core.api.Assertions.assertThat(stageRepository.count()).isEqualTo(11);
    }

    @Test
    void returnsAuthenticatedSessionForValidJwt() throws Exception {
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

        String accessToken = objectMapper.readTree(response).get("accessToken").asText();

        mockMvc.perform(apiGet("/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("eliezer@email.com"))
                .andExpect(jsonPath("$.currentConstruction.currentStage.name").value("Fundação"));
    }

    @Test
    void rejectsInvalidGoogleCredential() throws Exception {
        when(googleTokenVerifier.verify("invalid-google-token"))
                .thenThrow(new InvalidGoogleCredentialException("Google credential is invalid."));

        mockMvc.perform(apiPost("/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthGoogleRequest("invalid-google-token"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Google credential is invalid."));
    }

    @Test
    void rejectsAuthMeWithoutJwt() throws Exception {
        mockMvc.perform(apiGet("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiPost(String path) {
        return post(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiGet(String path) {
        return get(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }
}
