package br.com.obraexpenses.category.service;

import java.util.List;

import br.com.obraexpenses.category.api.CategoryResponse;
import br.com.obraexpenses.category.domain.Category;
import br.com.obraexpenses.category.domain.CategoryRepository;
import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.service.ConstructionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ConstructionService constructionService;

    public CategoryService(CategoryRepository categoryRepository, ConstructionService constructionService) {
        this.categoryRepository = categoryRepository;
        this.constructionService = constructionService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories(Long userId, String activeFilter) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        List<Category> categories = switch (activeFilter) {
            case "true" -> categoryRepository.findAllByConstructionIdAndActiveOrderByIdAsc(construction.getId(), true);
            case "false" -> categoryRepository.findAllByConstructionIdAndActiveOrderByIdAsc(construction.getId(), false);
            case "all" -> categoryRepository.findAllByConstructionIdOrderByIdAsc(construction.getId());
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid active filter.");
        };

        return categories.stream()
                .map(category -> new CategoryResponse(
                        category.getId(),
                        category.getName(),
                        category.isDefault(),
                        category.isActive()))
                .toList();
    }
}
