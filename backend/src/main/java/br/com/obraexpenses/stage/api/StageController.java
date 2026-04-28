package br.com.obraexpenses.stage.api;

import java.util.List;

import br.com.obraexpenses.common.security.AuthenticatedUser;
import br.com.obraexpenses.stage.service.StageService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stages")
public class StageController {

    private final StageService stageService;

    public StageController(StageService stageService) {
        this.stageService = stageService;
    }

    @GetMapping
    public List<StageResponse> listStages(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestParam(defaultValue = "true") String active) {
        return stageService.listStages(authenticatedUser.userId(), active);
    }
}
