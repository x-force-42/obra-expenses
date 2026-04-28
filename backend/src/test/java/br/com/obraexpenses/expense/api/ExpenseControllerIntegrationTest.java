package br.com.obraexpenses.expense.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

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
import br.com.obraexpenses.user.domain.User;
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
class ExpenseControllerIntegrationTest {

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
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @MockBean
    private GoogleTokenVerifier googleTokenVerifier;

    @Test
    void createsValidExpense() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        mockMvc.perform(apiPost("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", new BigDecimal("330.00"),
                                "categoryId", category.getId(),
                                "stageId", stage.getId(),
                                "description", "Locacao container"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(330.0))
                .andExpect(jsonPath("$.category.id").value(category.getId()))
                .andExpect(jsonPath("$.stage.id").value(stage.getId()))
                .andExpect(jsonPath("$.occurredAt").isString())
                .andExpect(jsonPath("$.createdAt").isString());

        org.assertj.core.api.Assertions.assertThat(expenseRepository.count()).isEqualTo(1);
    }

    @Test
    void rejectsExpenseWithoutAmount() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        mockMvc.perform(apiPost("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "categoryId", category.getId(),
                                "stageId", stage.getId(),
                                "description", "Sem valor"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields[0].field").value("amount"));
    }

    @Test
    void rejectsExpenseWithZeroAmount() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        mockMvc.perform(apiPost("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", BigDecimal.ZERO,
                                "categoryId", category.getId(),
                                "stageId", stage.getId(),
                                "description", "Valor invalido"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields[0].field").value("amount"));
    }

    @Test
    void rejectsCategoryFromAnotherConstruction() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Category foreignCategory = createCategory(createConstruction(createUser("owner-2")), "Frete");

        mockMvc.perform(apiPost("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", new BigDecimal("50.00"),
                                "categoryId", foreignCategory.getId(),
                                "stageId", stage.getId()))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Category does not belong to current construction."));
    }

    @Test
    void rejectsStageFromAnotherConstruction() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage foreignStage = createStage(createConstruction(createUser("owner-3")), "Cobertura");

        mockMvc.perform(apiPost("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", new BigDecimal("50.00"),
                                "categoryId", category.getId(),
                                "stageId", foreignStage.getId()))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Stage does not belong to current construction."));
    }

    @Test
    void listsExpensesPaginated() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        createExpense(construction, category, stage, "Primeira", new BigDecimal("120.00"), Instant.parse("2026-04-20T12:00:00Z"), false);
        Expense latestExpense = createExpense(
                construction,
                category,
                stage,
                "Segunda",
                new BigDecimal("330.00"),
                Instant.parse("2026-04-25T12:00:00Z"),
                false);

        mockMvc.perform(apiGet("/expenses?page=0&size=1")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(latestExpense.getId()));
    }

    @Test
    void excludesDeletedExpensesFromNormalListings() throws Exception {
        String accessToken = authenticate();
        Construction construction = currentConstruction();
        Category category = categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);
        Stage stage = stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId()).get(0);

        createExpense(construction, category, stage, "Ativa", new BigDecimal("90.00"), Instant.parse("2026-04-25T12:00:00Z"), false);
        createExpense(construction, category, stage, "Removida", new BigDecimal("110.00"), Instant.parse("2026-04-24T12:00:00Z"), true);

        mockMvc.perform(apiGet("/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].description").value("Ativa"));
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

    private Construction currentConstruction() {
        return constructionRepository.findAll().get(0);
    }

    private User createUser(String suffix) {
        User user = new User();
        user.setGoogleSubject("subject-" + suffix);
        user.setName("Owner " + suffix);
        user.setEmail(suffix + "@email.com");
        user.setPictureUrl("https://example.com/" + suffix + ".jpg");
        return userRepository.save(user);
    }

    private Construction createConstruction(User user) {
        Construction construction = new Construction();
        construction.setOwner(user);
        construction.setName("Obra " + user.getId());
        return constructionRepository.save(construction);
    }

    private Category createCategory(Construction construction, String name) {
        Category category = new Category();
        category.setConstruction(construction);
        category.setName(name);
        category.setDefault(false);
        category.setActive(true);
        return categoryRepository.save(category);
    }

    private Stage createStage(Construction construction, String name) {
        Stage stage = new Stage();
        stage.setConstruction(construction);
        stage.setName(name);
        stage.setDefault(false);
        stage.setActive(true);
        return stageRepository.save(stage);
    }

    private Expense createExpense(
            Construction construction,
            Category category,
            Stage stage,
            String description,
            BigDecimal amount,
            Instant occurredAt,
            boolean deleted) {
        Expense expense = new Expense();
        expense.setConstruction(construction);
        expense.setCategory(category);
        expense.setStage(stage);
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setOccurredAt(occurredAt);
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
