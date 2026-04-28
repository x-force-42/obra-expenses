package br.com.obraexpenses.dashboard.api;

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
class DashboardControllerIntegrationTest {

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
    void returnsAuthenticatedDashboardForCurrentMonthByDefault() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-04-28T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();
        Construction construction = constructionRepository.findAll().get(0);
        Category material = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Category labor = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(1);
        Stage foundation = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage structure = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(1);

        createExpense(construction, material, foundation, "Concreto", new BigDecimal("300.00"), "2026-04-25T10:00:00Z", false);
        createExpense(construction, labor, structure, "Equipe", new BigDecimal("150.00"), "2026-04-23T10:00:00Z", false);
        createExpense(construction, material, foundation, "Ferragens", new BigDecimal("200.00"), "2026-03-10T10:00:00Z", false);
        createExpense(construction, material, foundation, "Removida", new BigDecimal("999.00"), "2026-04-10T10:00:00Z", true);

        mockMvc.perform(apiGet("/dashboard")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("MONTH"))
                .andExpect(jsonPath("$.monthSpent").value(450.00))
                .andExpect(jsonPath("$.totalSpent").value(650.00))
                .andExpect(jsonPath("$.averageTicket").value(225.00))
                .andExpect(jsonPath("$.mainCategory.name").value("Material"))
                .andExpect(jsonPath("$.mainCategory.amount").value(300.00))
                .andExpect(jsonPath("$.mainStage.name").value("Fundação"))
                .andExpect(jsonPath("$.currentVsPreviousMonth.currentMonthAmount").value(450.00))
                .andExpect(jsonPath("$.currentVsPreviousMonth.previousMonthAmount").value(200.00))
                .andExpect(jsonPath("$.currentVsPreviousMonth.differenceAmount").value(250.00))
                .andExpect(jsonPath("$.byCategory.length()").value(2))
                .andExpect(jsonPath("$.byStage.length()").value(2))
                .andExpect(jsonPath("$.monthlyEvolution.length()").value(1))
                .andExpect(jsonPath("$.latestExpenses.length()").value(2))
                .andExpect(jsonPath("$.topExpenses.length()").value(2));
    }

    @Test
    void supportsLastThirtyDaysPeriod() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-04-28T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();
        Construction construction = constructionRepository.findAll().get(0);
        Category material = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage foundation = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        createExpense(construction, material, foundation, "Dentro 30 dias", new BigDecimal("100.00"), "2026-04-28T09:00:00Z", false);
        createExpense(construction, material, foundation, "Borda", new BigDecimal("50.00"), "2026-03-30T12:00:00Z", false);
        createExpense(construction, material, foundation, "Fora", new BigDecimal("75.00"), "2026-03-28T12:00:00Z", false);

        mockMvc.perform(apiGet("/dashboard?period=LAST_30_DAYS")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("LAST_30_DAYS"))
                .andExpect(jsonPath("$.totalSpent").value(225.00))
                .andExpect(jsonPath("$.averageTicket").value(75.00))
                .andExpect(jsonPath("$.byCategory[0].amount").value(150.00))
                .andExpect(jsonPath("$.latestExpenses.length()").value(2))
                .andExpect(jsonPath("$.topExpenses[0].amount").value(100.00))
                .andExpect(jsonPath("$.monthlyEvolution.length()").value(2));
    }

    @Test
    void returnsEmptyDashboardWhenConstructionHasNoExpenses() throws Exception {
        when(clock.instant()).thenReturn(Instant.parse("2026-04-28T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        String accessToken = authenticate();

        mockMvc.perform(apiGet("/dashboard?period=ALL")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.period").value("ALL"))
                .andExpect(jsonPath("$.monthSpent").value(0.00))
                .andExpect(jsonPath("$.totalSpent").value(0.00))
                .andExpect(jsonPath("$.averageTicket").value(0.00))
                .andExpect(jsonPath("$.mainCategory").doesNotExist())
                .andExpect(jsonPath("$.mainStage").doesNotExist())
                .andExpect(jsonPath("$.byCategory.length()").value(0))
                .andExpect(jsonPath("$.byStage.length()").value(0))
                .andExpect(jsonPath("$.monthlyEvolution.length()").value(0))
                .andExpect(jsonPath("$.latestExpenses.length()").value(0))
                .andExpect(jsonPath("$.topExpenses.length()").value(0));
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

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder apiGet(String pathAndQuery) {
        return get(API_CONTEXT_PATH + pathAndQuery).contextPath(API_CONTEXT_PATH);
    }
}
