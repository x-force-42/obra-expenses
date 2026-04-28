package br.com.obraexpenses.bootstrap.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.obraexpenses.auth.api.AuthGoogleRequest;
import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
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
class BootstrapDataControllerIntegrationTest {

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

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @Test
    void returnsCurrentConstructionCategoriesAndStagesForAuthenticatedUser() throws Exception {
        String accessToken = authenticate();

        mockMvc.perform(apiGet("/constructions/current")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Minha obra"))
                .andExpect(jsonPath("$.currentStage.name").value("Fundação"))
                .andExpect(jsonPath("$.createdAt").isString());

        mockMvc.perform(apiGet("/categories")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].name").value("Material"))
                .andExpect(jsonPath("$[0].active").value(true));

        mockMvc.perform(apiGet("/stages")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(11))
                .andExpect(jsonPath("$[0].name").value("Fundação"))
                .andExpect(jsonPath("$[0].active").value(true));
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
}
