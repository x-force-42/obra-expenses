package br.com.obraexpenses.construction.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConstructionRepository extends JpaRepository<Construction, Long> {

    Optional<Construction> findFirstByOwnerIdOrderByIdAsc(Long ownerId);
}
