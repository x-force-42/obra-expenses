package br.com.obraexpenses.stage.service;

import java.util.List;

import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.service.ConstructionService;
import br.com.obraexpenses.stage.api.StageResponse;
import br.com.obraexpenses.stage.domain.Stage;
import br.com.obraexpenses.stage.domain.StageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StageService {

    private final StageRepository stageRepository;
    private final ConstructionService constructionService;

    public StageService(StageRepository stageRepository, ConstructionService constructionService) {
        this.stageRepository = stageRepository;
        this.constructionService = constructionService;
    }

    @Transactional(readOnly = true)
    public List<StageResponse> listStages(Long userId, String activeFilter) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        List<Stage> stages = switch (activeFilter) {
            case "true" -> stageRepository.findAllByConstructionIdAndActiveOrderByIdAsc(construction.getId(), true);
            case "false" -> stageRepository.findAllByConstructionIdAndActiveOrderByIdAsc(construction.getId(), false);
            case "all" -> stageRepository.findAllByConstructionIdOrderByIdAsc(construction.getId());
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid active filter.");
        };

        return stages.stream()
                .map(stage -> new StageResponse(
                        stage.getId(),
                        stage.getName(),
                        stage.isDefault(),
                        stage.isActive()))
                .toList();
    }
}
