package br.com.obraexpenses.expense.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import br.com.obraexpenses.category.domain.Category;
import br.com.obraexpenses.category.domain.CategoryRepository;
import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.service.ConstructionService;
import br.com.obraexpenses.expense.api.ExpenseCategoryResponse;
import br.com.obraexpenses.expense.api.ExpenseCreateRequest;
import br.com.obraexpenses.expense.api.ExpenseListItemResponse;
import br.com.obraexpenses.expense.api.ExpensePageResponse;
import br.com.obraexpenses.expense.api.ExpenseResponse;
import br.com.obraexpenses.expense.api.ExpenseStageResponse;
import br.com.obraexpenses.expense.domain.Expense;
import br.com.obraexpenses.expense.domain.ExpenseRepository;
import br.com.obraexpenses.stage.domain.Stage;
import br.com.obraexpenses.stage.domain.StageRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ConstructionService constructionService;
    private final CategoryRepository categoryRepository;
    private final StageRepository stageRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            ConstructionService constructionService,
            CategoryRepository categoryRepository,
            StageRepository stageRepository) {
        this.expenseRepository = expenseRepository;
        this.constructionService = constructionService;
        this.categoryRepository = categoryRepository;
        this.stageRepository = stageRepository;
    }

    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseCreateRequest request) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        Category category = resolveCategory(construction, request.categoryId());
        Stage stage = resolveStage(construction, request.stageId());

        Expense expense = new Expense();
        expense.setConstruction(construction);
        expense.setCategory(category);
        expense.setStage(stage);
        expense.setAmount(request.amount());
        expense.setDescription(normalizeDescription(request.description()));
        expense.setOccurredAt(Instant.now());
        expense.setDeleted(false);

        Expense savedExpense = expenseRepository.save(expense);
        return toExpenseResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public ExpensePageResponse listExpenses(
            Long userId,
            int page,
            int size,
            String sort,
            LocalDate dateFrom,
            LocalDate dateTo,
            Long categoryId,
            Long stageId,
            String description,
            BigDecimal minAmount,
            BigDecimal maxAmount) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        Pageable pageable = PageRequest.of(page, size, buildSort(sort));

        Page<Expense> expensePage = expenseRepository.findAll(
                buildSpecification(
                        construction.getId(),
                        dateFrom,
                        dateTo,
                        categoryId,
                        stageId,
                        description,
                        minAmount,
                        maxAmount),
                pageable);

        return new ExpensePageResponse(
                expensePage.getContent().stream()
                        .map(this::toExpenseListItemResponse)
                        .toList(),
                expensePage.getNumber(),
                expensePage.getSize(),
                expensePage.getTotalElements(),
                expensePage.getTotalPages());
    }

    private Category resolveCategory(Construction construction, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category was not found."));

        if (!category.getConstruction().getId().equals(construction.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Category does not belong to current construction.");
        }

        return category;
    }

    private Stage resolveStage(Construction construction, Long stageId) {
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stage was not found."));

        if (!stage.getConstruction().getId().equals(construction.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Stage does not belong to current construction.");
        }

        return stage;
    }

    private String normalizeDescription(String description) {
        if (!StringUtils.hasText(description)) {
            return null;
        }

        return description.trim();
    }

    private Specification<Expense> buildSpecification(
            Long constructionId,
            LocalDate dateFrom,
            LocalDate dateTo,
            Long categoryId,
            Long stageId,
            String description,
            BigDecimal minAmount,
            BigDecimal maxAmount) {
        return (root, query, criteriaBuilder) -> {
            java.util.List<Predicate> predicates = new java.util.ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("construction").get("id"), constructionId));
            predicates.add(criteriaBuilder.isFalse(root.get("deleted")));

            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("occurredAt"),
                        dateFrom.atStartOfDay().toInstant(ZoneOffset.UTC)));
            }

            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThan(
                        root.get("occurredAt"),
                        dateTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC)));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (stageId != null) {
                predicates.add(criteriaBuilder.equal(root.get("stage").get("id"), stageId));
            }

            if (StringUtils.hasText(description)) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + description.trim().toLowerCase() + "%"));
            }

            if (minAmount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort buildSort(String sort) {
        String[] tokens = sort.split(",", 2);
        String property = tokens[0];
        Sort.Direction direction = tokens.length > 1
                ? Sort.Direction.fromOptionalString(tokens[1]).orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort direction."))
                : Sort.Direction.DESC;

        String mappedProperty = switch (property) {
            case "occurredAt" -> "occurredAt";
            case "amount" -> "amount";
            case "description" -> "description";
            case "category" -> "category.name";
            case "stage" -> "stage.name";
            case "createdAt" -> "createdAt";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort field.");
        };

        return Sort.by(direction, mappedProperty);
    }

    private ExpenseResponse toExpenseResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                new ExpenseCategoryResponse(expense.getCategory().getId(), expense.getCategory().getName()),
                new ExpenseStageResponse(expense.getStage().getId(), expense.getStage().getName()),
                expense.getOccurredAt(),
                expense.getCreatedAt(),
                expense.getUpdatedAt());
    }

    private ExpenseListItemResponse toExpenseListItemResponse(Expense expense) {
        return new ExpenseListItemResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                new ExpenseCategoryResponse(expense.getCategory().getId(), expense.getCategory().getName()),
                new ExpenseStageResponse(expense.getStage().getId(), expense.getStage().getName()),
                expense.getOccurredAt());
    }
}
