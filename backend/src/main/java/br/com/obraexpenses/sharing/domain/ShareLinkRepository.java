package br.com.obraexpenses.sharing.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByConstructionId(Long constructionId);

    Optional<ShareLink> findByConstructionIdAndActiveTrue(Long constructionId);

    Optional<ShareLink> findByTokenAndActiveTrue(String token);

    boolean existsByToken(String token);
}
