package br.com.obraexpenses.auth.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import br.com.obraexpenses.auth.api.AuthMeResponse;
import br.com.obraexpenses.auth.api.AuthResponse;
import br.com.obraexpenses.auth.api.CurrentConstructionResponse;
import br.com.obraexpenses.auth.api.StageSummaryResponse;
import br.com.obraexpenses.auth.api.UserSummaryResponse;
import br.com.obraexpenses.auth.domain.GoogleTokenVerifier;
import br.com.obraexpenses.auth.domain.GoogleUserInfo;
import br.com.obraexpenses.category.domain.Category;
import br.com.obraexpenses.category.domain.CategoryRepository;
import br.com.obraexpenses.common.security.JwtService;
import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.domain.ConstructionRepository;
import br.com.obraexpenses.stage.domain.Stage;
import br.com.obraexpenses.stage.domain.StageRepository;
import br.com.obraexpenses.user.domain.User;
import br.com.obraexpenses.user.domain.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final String DEFAULT_CONSTRUCTION_NAME = "Minha obra";
    private static final String INITIAL_STAGE_NAME = "Fundação";
    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Material",
            "Mão de Obra",
            "Ferramentas",
            "Documentação/Taxas",
            "Outros");
    private static final List<String> DEFAULT_STAGES = List.of(
            "Fundação",
            "Estrutura",
            "Alvenaria",
            "Cobertura",
            "Elétrica",
            "Hidráulica",
            "Reboco",
            "Piso",
            "Pintura",
            "Acabamento",
            "Outros");

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final ConstructionRepository constructionRepository;
    private final CategoryRepository categoryRepository;
    private final StageRepository stageRepository;
    private final JwtService jwtService;

    public AuthService(
            GoogleTokenVerifier googleTokenVerifier,
            UserRepository userRepository,
            ConstructionRepository constructionRepository,
            CategoryRepository categoryRepository,
            StageRepository stageRepository,
            JwtService jwtService) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.constructionRepository = constructionRepository;
        this.categoryRepository = categoryRepository;
        this.stageRepository = stageRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String credential) {
        GoogleUserInfo googleUserInfo = googleTokenVerifier.verify(credential);
        User user = createOrUpdateUser(googleUserInfo);
        Construction currentConstruction = ensureBootstrapData(user);
        String accessToken = jwtService.generateToken(user);

        return new AuthResponse(
                accessToken,
                "Bearer",
                toUserSummary(user),
                toConstructionSummary(currentConstruction));
    }

    @Transactional(readOnly = true)
    public AuthMeResponse getAuthenticatedSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
        Construction currentConstruction = constructionRepository.findFirstByOwnerIdOrderByIdAsc(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current construction was not found."));

        return new AuthMeResponse(
                toUserSummary(user),
                toConstructionSummary(currentConstruction));
    }

    private User createOrUpdateUser(GoogleUserInfo googleUserInfo) {
        Optional<User> existingUser = userRepository.findByGoogleSubject(googleUserInfo.googleSubject());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(googleUserInfo.name());
            user.setEmail(googleUserInfo.email());
            user.setPictureUrl(googleUserInfo.pictureUrl());

            return user;
        }

        User user = new User();
        user.setGoogleSubject(googleUserInfo.googleSubject());
        user.setName(googleUserInfo.name());
        user.setEmail(googleUserInfo.email());
        user.setPictureUrl(googleUserInfo.pictureUrl());

        return userRepository.save(user);
    }

    private Construction ensureBootstrapData(User user) {
        Construction construction = constructionRepository.findFirstByOwnerIdOrderByIdAsc(user.getId())
                .orElseGet(() -> createDefaultConstruction(user));

        ensureDefaultStages(construction);
        Stage initialStage = stageRepository.findByConstructionIdAndName(construction.getId(), INITIAL_STAGE_NAME)
                .orElseThrow(() -> new IllegalStateException("Initial stage was not created."));

        if (construction.getCurrentStage() == null) {
            construction.setCurrentStage(initialStage);
        }

        ensureDefaultCategories(construction);

        return construction;
    }

    private Construction createDefaultConstruction(User user) {
        Construction construction = new Construction();
        construction.setOwner(user);
        construction.setName(DEFAULT_CONSTRUCTION_NAME);

        return constructionRepository.save(construction);
    }

    private void ensureDefaultStages(Construction construction) {
        Set<String> existingNames = new LinkedHashSet<>(stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId())
                .stream()
                .map(Stage::getName)
                .toList());

        List<Stage> missingStages = DEFAULT_STAGES.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> createStage(construction, name))
                .toList();

        if (!missingStages.isEmpty()) {
            stageRepository.saveAll(missingStages);
        }
    }

    private void ensureDefaultCategories(Construction construction) {
        Set<String> existingNames = new LinkedHashSet<>(categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId())
                .stream()
                .map(Category::getName)
                .toList());

        List<Category> missingCategories = DEFAULT_CATEGORIES.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> createCategory(construction, name))
                .toList();

        if (!missingCategories.isEmpty()) {
            categoryRepository.saveAll(missingCategories);
        }
    }

    private Stage createStage(Construction construction, String name) {
        Stage stage = new Stage();
        stage.setConstruction(construction);
        stage.setName(name);
        stage.setDefault(true);
        stage.setActive(true);

        return stage;
    }

    private Category createCategory(Construction construction, String name) {
        Category category = new Category();
        category.setConstruction(construction);
        category.setName(name);
        category.setDefault(true);
        category.setActive(true);

        return category;
    }

    private UserSummaryResponse toUserSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPictureUrl());
    }

    private CurrentConstructionResponse toConstructionSummary(Construction construction) {
        Stage currentStage = construction.getCurrentStage();

        return new CurrentConstructionResponse(
                construction.getId(),
                construction.getName(),
                currentStage != null
                        ? new StageSummaryResponse(currentStage.getId(), currentStage.getName())
                        : null);
    }
}
