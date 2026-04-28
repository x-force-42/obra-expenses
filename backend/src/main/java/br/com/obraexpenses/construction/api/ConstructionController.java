package br.com.obraexpenses.construction.api;

import br.com.obraexpenses.common.security.AuthenticatedUser;
import br.com.obraexpenses.construction.service.ConstructionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/constructions")
public class ConstructionController {

    private final ConstructionService constructionService;

    public ConstructionController(ConstructionService constructionService) {
        this.constructionService = constructionService;
    }

    @GetMapping("/current")
    public ConstructionCurrentResponse getCurrentConstruction(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return constructionService.getCurrentConstructionResponse(authenticatedUser.userId());
    }
}
