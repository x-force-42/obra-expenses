package br.com.obraexpenses.sharing.api;

import br.com.obraexpenses.dashboard.api.DashboardPeriod;
import br.com.obraexpenses.dashboard.api.DashboardResponse;
import br.com.obraexpenses.dashboard.service.DashboardService;
import br.com.obraexpenses.sharing.service.ShareLinkService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/dashboard")
public class PublicDashboardController {

    private final ShareLinkService shareLinkService;
    private final DashboardService dashboardService;

    public PublicDashboardController(
            ShareLinkService shareLinkService,
            DashboardService dashboardService) {
        this.shareLinkService = shareLinkService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{token}")
    public DashboardResponse getPublicDashboard(
            @PathVariable String token,
            @RequestParam(defaultValue = "ALL") DashboardPeriod period) {
        Long constructionId = shareLinkService.getActiveConstructionIdByToken(token);
        return dashboardService.getDashboardForConstructionId(constructionId, period);
    }
}
