package br.com.obraexpenses.dashboard.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.service.ConstructionService;
import br.com.obraexpenses.dashboard.api.DashboardBreakdownItemResponse;
import br.com.obraexpenses.dashboard.api.DashboardCategoryItemResponse;
import br.com.obraexpenses.dashboard.api.DashboardComparisonResponse;
import br.com.obraexpenses.dashboard.api.DashboardExpenseItemResponse;
import br.com.obraexpenses.dashboard.api.DashboardMonthlyEvolutionItemResponse;
import br.com.obraexpenses.dashboard.api.DashboardPeriod;
import br.com.obraexpenses.dashboard.api.DashboardResponse;
import br.com.obraexpenses.dashboard.api.DashboardStageItemResponse;
import br.com.obraexpenses.expense.domain.Expense;
import br.com.obraexpenses.expense.domain.ExpenseRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final Comparator<Expense> OCCURRED_AT_DESC =
            Comparator.comparing(Expense::getOccurredAt).reversed();
    private static final Comparator<Expense> AMOUNT_DESC =
            Comparator.comparing(Expense::getAmount, Comparator.reverseOrder())
                    .thenComparing(Expense::getOccurredAt, Comparator.reverseOrder())
                    .thenComparing(Expense::getId, Comparator.reverseOrder());

    private final ExpenseRepository expenseRepository;
    private final ConstructionService constructionService;
    private final Clock clock;

    public DashboardService(
            ExpenseRepository expenseRepository,
            ConstructionService constructionService,
            Clock clock) {
        this.expenseRepository = expenseRepository;
        this.constructionService = constructionService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId, DashboardPeriod period) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        return getDashboardForConstructionId(construction.getId(), period);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardForConstructionId(Long constructionId, DashboardPeriod period) {
        Instant now = clock.instant();
        LocalDate today = LocalDate.ofInstant(now, ZoneOffset.UTC);
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth previousMonth = currentMonth.minusMonths(1);

        List<Expense> allExpenses = expenseRepository.findAll(
                buildSpecification(constructionId, null, null),
                Sort.by(Sort.Direction.DESC, "occurredAt"));
        List<Expense> filteredExpenses = expenseRepository.findAll(
                buildSpecification(
                        constructionId,
                        periodStart(period, today),
                        periodEnd(period, today)),
                Sort.by(Sort.Direction.DESC, "occurredAt"));

        BigDecimal totalSpent = sumAmounts(allExpenses);
        BigDecimal monthSpent = sumAmounts(expensesInMonth(allExpenses, currentMonth));
        BigDecimal averageTicket = filteredExpenses.isEmpty()
                ? BigDecimal.ZERO
                : scale(sumAmounts(filteredExpenses)
                        .divide(BigDecimal.valueOf(filteredExpenses.size()), 2, RoundingMode.HALF_UP));

        BigDecimal currentMonthAmount = sumAmounts(expensesInMonth(allExpenses, currentMonth));
        BigDecimal previousMonthAmount = sumAmounts(expensesInMonth(allExpenses, previousMonth));
        BigDecimal differenceAmount = scale(currentMonthAmount.subtract(previousMonthAmount));

        return new DashboardResponse(
                period,
                scale(monthSpent),
                scale(totalSpent),
                averageTicket,
                buildMainCategory(filteredExpenses),
                buildMainStage(filteredExpenses),
                new DashboardComparisonResponse(
                        scale(currentMonthAmount),
                        scale(previousMonthAmount),
                        differenceAmount,
                        calculateDifferencePercentage(currentMonthAmount, previousMonthAmount)),
                buildCategoryBreakdown(filteredExpenses),
                buildStageBreakdown(filteredExpenses),
                buildMonthlyEvolution(filteredExpenses),
                buildLatestExpenses(filteredExpenses),
                buildTopExpenses(filteredExpenses));
    }

    private Specification<Expense> buildSpecification(
            Long constructionId,
            Instant periodStart,
            Instant periodEnd) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("construction").get("id"), constructionId));
            predicates.add(criteriaBuilder.isFalse(root.get("deleted")));

            if (periodStart != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("occurredAt"), periodStart));
            }

            if (periodEnd != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("occurredAt"), periodEnd));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Instant periodStart(DashboardPeriod period, LocalDate today) {
        return switch (period) {
            case MONTH -> YearMonth.from(today).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            case LAST_30_DAYS -> today.minusDays(29).atStartOfDay().toInstant(ZoneOffset.UTC);
            case ALL -> null;
        };
    }

    private Instant periodEnd(DashboardPeriod period, LocalDate today) {
        return switch (period) {
            case MONTH -> YearMonth.from(today).plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            case LAST_30_DAYS, ALL -> today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        };
    }

    private List<Expense> expensesInMonth(List<Expense> expenses, YearMonth yearMonth) {
        return expenses.stream()
                .filter(expense -> YearMonth.from(LocalDate.ofInstant(expense.getOccurredAt(), ZoneOffset.UTC)).equals(yearMonth))
                .toList();
    }

    private DashboardBreakdownItemResponse buildMainCategory(List<Expense> expenses) {
        return buildMainBreakdown(
                expenses,
                expense -> new KeyValue(expense.getCategory().getId(), expense.getCategory().getName()));
    }

    private DashboardBreakdownItemResponse buildMainStage(List<Expense> expenses) {
        return buildMainBreakdown(
                expenses,
                expense -> new KeyValue(expense.getStage().getId(), expense.getStage().getName()));
    }

    private DashboardBreakdownItemResponse buildMainBreakdown(
            List<Expense> expenses,
            Function<Expense, KeyValue> classifier) {
        BigDecimal total = sumAmounts(expenses);
        return aggregate(expenses, classifier).entrySet().stream()
                .max(Map.Entry.<KeyValue, BigDecimal>comparingByValue()
                        .thenComparing(entry -> entry.getKey().id()))
                .map(entry -> new DashboardBreakdownItemResponse(
                        entry.getKey().id(),
                        entry.getKey().name(),
                        scale(entry.getValue()),
                        calculatePercentage(entry.getValue(), total)))
                .orElse(null);
    }

    private List<DashboardCategoryItemResponse> buildCategoryBreakdown(List<Expense> expenses) {
        BigDecimal total = sumAmounts(expenses);

        return aggregate(expenses, expense -> new KeyValue(expense.getCategory().getId(), expense.getCategory().getName()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<KeyValue, BigDecimal>comparingByValue().reversed()
                        .thenComparing(entry -> entry.getKey().id()))
                .map(entry -> new DashboardCategoryItemResponse(
                        entry.getKey().id(),
                        entry.getKey().name(),
                        scale(entry.getValue()),
                        calculatePercentage(entry.getValue(), total)))
                .toList();
    }

    private List<DashboardStageItemResponse> buildStageBreakdown(List<Expense> expenses) {
        BigDecimal total = sumAmounts(expenses);

        return aggregate(expenses, expense -> new KeyValue(expense.getStage().getId(), expense.getStage().getName()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<KeyValue, BigDecimal>comparingByValue().reversed()
                        .thenComparing(entry -> entry.getKey().id()))
                .map(entry -> new DashboardStageItemResponse(
                        entry.getKey().id(),
                        entry.getKey().name(),
                        scale(entry.getValue()),
                        calculatePercentage(entry.getValue(), total)))
                .toList();
    }

    private List<DashboardMonthlyEvolutionItemResponse> buildMonthlyEvolution(List<Expense> expenses) {
        return expenses.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        expense -> YearMonth.from(LocalDate.ofInstant(expense.getOccurredAt(), ZoneOffset.UTC)),
                        LinkedHashMap::new,
                        java.util.stream.Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add)))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new DashboardMonthlyEvolutionItemResponse(
                        entry.getKey().toString(),
                        scale(entry.getValue())))
                .toList();
    }

    private List<DashboardExpenseItemResponse> buildLatestExpenses(List<Expense> expenses) {
        return expenses.stream()
                .sorted(OCCURRED_AT_DESC)
                .limit(5)
                .map(this::toDashboardExpenseItem)
                .toList();
    }

    private List<DashboardExpenseItemResponse> buildTopExpenses(List<Expense> expenses) {
        return expenses.stream()
                .sorted(AMOUNT_DESC)
                .limit(5)
                .map(this::toDashboardExpenseItem)
                .toList();
    }

    private DashboardExpenseItemResponse toDashboardExpenseItem(Expense expense) {
        return new DashboardExpenseItemResponse(
                expense.getId(),
                scale(expense.getAmount()),
                expense.getDescription(),
                expense.getCategory().getName(),
                expense.getStage().getName(),
                expense.getOccurredAt());
    }

    private Map<KeyValue, BigDecimal> aggregate(List<Expense> expenses, Function<Expense, KeyValue> classifier) {
        Map<KeyValue, BigDecimal> totals = new LinkedHashMap<>();

        for (Expense expense : expenses) {
            KeyValue key = classifier.apply(expense);
            totals.merge(key, expense.getAmount(), BigDecimal::add);
        }

        return totals;
    }

    private BigDecimal sumAmounts(List<Expense> expenses) {
        return scale(expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    private BigDecimal calculatePercentage(BigDecimal amount, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return scale(amount.multiply(ONE_HUNDRED).divide(total, 2, RoundingMode.HALF_UP));
    }

    private BigDecimal calculateDifferencePercentage(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO : ONE_HUNDRED;
        }

        return scale(current.subtract(previous)
                .multiply(ONE_HUNDRED)
                .divide(previous, 2, RoundingMode.HALF_UP));
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record KeyValue(Long id, String name) {
    }
}
