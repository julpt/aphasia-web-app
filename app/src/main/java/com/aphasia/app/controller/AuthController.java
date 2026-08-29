package com.aphasia.app.controller;

import com.aphasia.app.model.dto.ChangePasswordRequest;
import com.aphasia.app.model.dto.EmailPasswordRequest;
import com.aphasia.app.model.dto.SetPasswordRequest;
import com.aphasia.app.repository.UserRepository;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityContextRepository securityContextRepository;
    private final UserRepository userRepository;

    @PostMapping("/request-link")
    public Map<String, String> requestLink(@RequestBody Map<String, String> body) {
        authService.requestMagicLink(body.get("email"));
        return Map.of("message", "Verifică-ți emailul.");
    }

    @GetMapping("/verify")
    public Map<String, String> verify(@RequestParam String token,
                                      HttpServletRequest request,
                                      HttpServletResponse response) {
        SecurityContext context = authService.verifyToken(token);

        securityContextRepository.saveContext(context, request, response);

        return Map.of("message", "Autentificat cu succes.");
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody EmailPasswordRequest request,
                                        HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        SecurityContext context = authService.register(request.email(), request.password());
        if (context != null) {
            securityContextRepository.saveContext(context, httpRequest, httpResponse);
        }
        return Map.of("message", "Cont creat. Autentificare...");
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody EmailPasswordRequest request,
                                     HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        SecurityContext context = authService.login(request.email(), request.password());
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
        return Map.of("message", "Autentificat cu succes.");
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response,
                SecurityContextHolder.getContext().getAuthentication());
        return Map.of("message", "Deconectat cu succes.");
    }

    @GetMapping("/me")
    public Map<String, String> me(@AuthenticationPrincipal AppUserDetails currentUser) {
        if (currentUser == null) {
            return Map.of("authenticated", "false");
        }
        return Map.of(
                "authenticated", "true",
                "email", currentUser.getUser().getEmail(),
                "role", currentUser.getUser().getRole().name()
        );
    }

    @PostMapping("/set-password")
    public Map<String, String> setPassword(@RequestBody SetPasswordRequest request,
                                           @AuthenticationPrincipal AppUserDetails currentUser) {
        authService.setPassword(currentUser.getUser(), request.newPassword());
        return Map.of("message", "Parolă setată cu succes.");
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody ChangePasswordRequest request,
                                              @AuthenticationPrincipal AppUserDetails currentUser) {
        authService.changePassword(currentUser.getUser(), request.oldPassword(), request.newPassword());
        return Map.of("message", "Parolă schimbată cu succes.");
    }

    @DeleteMapping("/me")
    public Map<String, String> deleteAccount(@AuthenticationPrincipal AppUserDetails currentUser,
                                             HttpServletRequest request, HttpServletResponse response) {
        currentUser.getUser().setDeletedAt(java.time.Instant.now());
        userRepository.save(currentUser.getUser());
        new SecurityContextLogoutHandler().logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        return Map.of("message", "Cont șters.");
    }

}