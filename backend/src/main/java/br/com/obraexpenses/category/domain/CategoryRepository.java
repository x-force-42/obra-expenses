package br.com.obraexpenses.category.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByConstructionIdOrderByIdAsc(Long constructionId);

    List<Category> findAllByConstructionIdAndActiveOrderByIdAsc(Long constructionId, boolean active);

    Optional<Category> findByIdAndConstructionId(Long id, Long constructionId);
}
