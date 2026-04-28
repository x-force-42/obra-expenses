package br.com.obraexpenses.stage.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StageRepository extends JpaRepository<Stage, Long> {

    List<Stage> findAllByConstructionIdOrderByIdAsc(Long constructionId);

    List<Stage> findAllByConstructionIdAndActiveOrderByIdAsc(Long constructionId, boolean active);

    Optional<Stage> findByConstructionIdAndName(Long constructionId, String name);

    Optional<Stage> findByIdAndConstructionId(Long id, Long constructionId);
}
