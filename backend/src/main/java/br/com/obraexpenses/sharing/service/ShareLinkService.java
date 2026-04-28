package br.com.obraexpenses.sharing.service;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;

import br.com.obraexpenses.construction.domain.Construction;
import br.com.obraexpenses.construction.service.ConstructionService;
import br.com.obraexpenses.sharing.api.ShareLinkDisabledResponse;
import br.com.obraexpenses.sharing.api.ShareLinkRegeneratedResponse;
import br.com.obraexpenses.sharing.api.ShareLinkResponse;
import br.com.obraexpenses.sharing.domain.ShareLink;
import br.com.obraexpenses.sharing.domain.ShareLinkRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ShareLinkService {

    private static final int TOKEN_BYTES = 24;

    private final ShareLinkRepository shareLinkRepository;
    private final ConstructionService constructionService;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String publicBaseUrl;

    public ShareLinkService(
            ShareLinkRepository shareLinkRepository,
            ConstructionService constructionService,
            Clock clock,
            @Value("${app.sharing.public-base-url:http://localhost:5173}") String publicBaseUrl) {
        this.shareLinkRepository = shareLinkRepository;
        this.constructionService = constructionService;
        this.clock = clock;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Transactional(readOnly = true)
    public ShareLinkResponse getCurrentShareLink(Long userId) {
        Construction construction = constructionService.getCurrentConstruction(userId);

        return shareLinkRepository.findByConstructionIdAndActiveTrue(construction.getId())
                .map(this::toShareLinkResponse)
                .orElseGet(this::inactiveShareLinkResponse);
    }

    @Transactional
    public ShareLinkResponse createOrGetActiveShareLink(Long userId) {
        Construction construction = constructionService.getCurrentConstruction(userId);

        ShareLink activeShareLink = shareLinkRepository.findByConstructionIdAndActiveTrue(construction.getId())
                .orElse(null);

        if (activeShareLink != null) {
            return toShareLinkResponse(activeShareLink);
        }

        shareLinkRepository.findByConstructionId(construction.getId())
                .ifPresent(existingShareLink -> {
                    shareLinkRepository.delete(existingShareLink);
                    shareLinkRepository.flush();
                });

        ShareLink shareLink = new ShareLink();
        shareLink.setConstruction(construction);
        shareLink.setToken(generateUniqueToken());
        shareLink.setActive(true);
        shareLink.setDisabledAt(null);
        shareLink.setRegeneratedAt(null);

        return toShareLinkResponse(shareLinkRepository.saveAndFlush(shareLink));
    }

    @Transactional
    public ShareLinkDisabledResponse disableShareLink(Long userId) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        ShareLink shareLink = shareLinkRepository.findByConstructionIdAndActiveTrue(construction.getId())
                .orElse(null);

        if (shareLink == null) {
            Instant disabledAt = shareLinkRepository.findByConstructionId(construction.getId())
                    .map(ShareLink::getDisabledAt)
                    .orElse(null);
            return new ShareLinkDisabledResponse(false, disabledAt);
        }

        Instant now = clock.instant();
        shareLink.setActive(false);
        shareLink.setDisabledAt(now);
        shareLinkRepository.save(shareLink);

        return new ShareLinkDisabledResponse(false, now);
    }

    @Transactional
    public ShareLinkRegeneratedResponse regenerateShareLink(Long userId) {
        Construction construction = constructionService.getCurrentConstruction(userId);
        Instant now = clock.instant();

        ShareLink shareLink = shareLinkRepository.findByConstructionId(construction.getId())
                .orElseGet(() -> {
                    ShareLink created = new ShareLink();
                    created.setConstruction(construction);
                    return created;
                });

        shareLink.setToken(generateUniqueToken());
        shareLink.setActive(true);
        shareLink.setDisabledAt(null);
        shareLink.setRegeneratedAt(now);

        ShareLink savedShareLink = shareLinkRepository.saveAndFlush(shareLink);

        return new ShareLinkRegeneratedResponse(
                true,
                savedShareLink.getToken(),
                buildPublicUrl(savedShareLink.getToken()),
                savedShareLink.getCreatedAt(),
                savedShareLink.getRegeneratedAt());
    }

    @Transactional(readOnly = true)
    public Long getActiveConstructionIdByToken(String token) {
        return shareLinkRepository.findByTokenAndActiveTrue(token)
                .map(shareLink -> shareLink.getConstruction().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Public dashboard link was not found."));
    }

    private ShareLinkResponse toShareLinkResponse(ShareLink shareLink) {
        return new ShareLinkResponse(
                true,
                shareLink.getToken(),
                buildPublicUrl(shareLink.getToken()),
                shareLink.getCreatedAt(),
                null);
    }

    private ShareLinkResponse inactiveShareLinkResponse() {
        return new ShareLinkResponse(false, null, null, null, null);
    }

    private String buildPublicUrl(String token) {
        return publicBaseUrl.replaceAll("/+$", "") + "/public/dashboard/" + token;
    }

    private String generateUniqueToken() {
        String token;

        do {
            byte[] bytes = new byte[TOKEN_BYTES];
            secureRandom.nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } while (shareLinkRepository.existsByToken(token));

        return token;
    }
}
