package br.com.obraexpenses.sharing.api;

import br.com.obraexpenses.common.security.AuthenticatedUser;
import br.com.obraexpenses.sharing.service.ShareLinkService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/share-link")
public class ShareLinkController {

    private final ShareLinkService shareLinkService;

    public ShareLinkController(ShareLinkService shareLinkService) {
        this.shareLinkService = shareLinkService;
    }

    @GetMapping
    public ShareLinkResponse getCurrentShareLink(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return shareLinkService.getCurrentShareLink(authenticatedUser.userId());
    }

    @PostMapping
    public ShareLinkResponse createShareLink(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return shareLinkService.createOrGetActiveShareLink(authenticatedUser.userId());
    }

    @DeleteMapping
    public ShareLinkDisabledResponse disableShareLink(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return shareLinkService.disableShareLink(authenticatedUser.userId());
    }

    @PostMapping("/regenerate")
    public ShareLinkRegeneratedResponse regenerateShareLink(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return shareLinkService.regenerateShareLink(authenticatedUser.userId());
    }
}
