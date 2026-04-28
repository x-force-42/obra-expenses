package br.com.obraexpenses.construction.service;

import br.com.obraexpenses.construction.api.ConstructionCurrentResponse;
import br.com.obraexpenses.construction.api.ConstructionStageResponse;
import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.domain.ConstructionRepository;
import br.com.obraexpenses.stage.domain.Stage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConstructionService {

    private final ConstructionRepository constructionRepository;

    public ConstructionService(ConstructionRepository constructionRepository) {
        this.constructionRepository = constructionRepository;
    }

    @Transactional(readOnly = true)
    public ConstructionCurrentResponse getCurrentConstructionResponse(Long userId) {
        Construction construction = getCurrentConstruction(userId);
        Stage currentStage = construction.getCurrentStage();

        return new ConstructionCurrentResponse(
                construction.getId(),
                construction.getName(),
                currentStage != null
                        ? new ConstructionStageResponse(currentStage.getId(), currentStage.getName())
                        : null,
                construction.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public Construction getCurrentConstruction(Long userId) {
        return constructionRepository.findFirstByOwnerIdOrderByIdAsc(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current construction was not found."));
    }
}
