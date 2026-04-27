package br.com.obraexpenses.auth.api;

import br.com.obraexpenses.auth.service.AuthService;
import br.com.obraexpenses.common.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public AuthResponse authenticateWithGoogle(@Valid @RequestBody AuthGoogleRequest request) {
        return authService.authenticateWithGoogle(request.credential());
    }

    @GetMapping("/me")
    public AuthMeResponse getAuthenticatedSession(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return authService.getAuthenticatedSession(authenticatedUser.userId());
    }
}
