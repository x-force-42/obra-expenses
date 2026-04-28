package br.com.obraexpenses.sharing.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import br.com.obraexpenses.auth.api.AuthGoogleRequest;
import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
import br.com.obraexpenses.category.domain.Category;
import br.com.obraexpenses.category.domain.CategoryRepository;
import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.domain.ConstructionRepository;
import br.com.obraexpenses.expense.domain.Expense;
import br.com.obraexpenses.expense.domain.ExpenseRepository;
import br.com.obraexpenses.stage.domain.Stage;
import br.com.obraexpenses.stage.domain.StageRepository;
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
class PublicDashboardControllerIntegrationTest {

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
    private ConstructionRepository constructionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StageRepository stageRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @MockBean
    private Clock clock;

    @Test
    void returnsPublicDashboardForActiveTokenUsingAllPeriodByDefault() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-05-01T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();
        String shareToken = createShareLink(accessToken);
        Construction construction = constructionRepository.findAll().get(0);
        Category material = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage foundation = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        createExpense(construction, material, foundation, "Concreto", new BigDecimal("300.00"), "2026-04-25T10:00:00Z", false);
        createExpense(construction, material, foundation, "Ferragens", new BigDecimal("200.00"), "2026-03-10T10:00:00Z", false);

        mockMvc.perform(apiPublicGet("/public/dashboard/" + shareToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("ALL"))
                .andExpect(jsonPath("$.totalSpent").value(500.00))
                .andExpect(jsonPath("$.averageTicket").value(250.00))
                .andExpect(jsonPath("$.latestExpenses.length()").value(2))
                .andExpect(jsonPath("$.topExpenses[0].amount").value(300.00));
    }

    @Test
    void supportsPeriodFilteringForPublicDashboard() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-05-01T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();
        String shareToken = createShareLink(accessToken);
        Construction construction = constructionRepository.findAll().get(0);
        Category material = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage foundation = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        createExpense(construction, material, foundation, "Dentro do mês", new BigDecimal("100.00"), "2026-05-01T09:00:00Z", false);
        createExpense(construction, material, foundation, "Fora do mês", new BigDecimal("50.00"), "2026-04-20T12:00:00Z", false);

        mockMvc.perform(apiPublicGet("/public/dashboard/" + shareToken + "?period=MONTH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("MONTH"))
                .andExpect(jsonPath("$.averageTicket").value(100.00))
                .andExpect(jsonPath("$.latestExpenses.length()").value(1))
                .andExpect(jsonPath("$.topExpenses[0].description").value("Dentro do mês"));
    }

    @Test
    void rejectsMissingOrInactiveShareToken() throws Exception {
        mockMvc.perform(apiPublicGet("/public/dashboard/missing-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Public dashboard link was not found."));
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

    private String createShareLink(String accessToken) throws Exception {
        String response = mockMvc.perform(apiPost("/share-link")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }

    private Expense createExpense(
            Construction construction,
            Category category,
            Stage stage,
            String description,
            BigDecimal amount,
            String occurredAt,
            boolean deleted) {
        Expense expense = new Expense();
        expense.setConstruction(construction);
        expense.setCategory(category);
        expense.setStage(stage);
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setOccurredAt(Instant.parse(occurredAt));
        expense.setDeleted(deleted);
        return expenseRepository.save(expense);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiPost(String path) {
        return post(API_CONTEXT_PATH + path).contextPath(API_CONTEXT_PATH);
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiPublicGet(String pathAndQuery) {
        return get(API_CONTEXT_PATH + pathAndQuery).contextPath(API_CONTEXT_PATH);
    }
}
