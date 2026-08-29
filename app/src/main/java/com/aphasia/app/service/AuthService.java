package com.aphasia.app.service;

import com.aphasia.app.model.entities.MagicLinkToken;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.repository.MagicLinkTokenRepository;
import com.aphasia.app.repository.UserRepository;
import com.aphasia.app.security.AppUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int TOKEN_VALID_MINUTES = 15;

    private final EmailService emailService;
    private final MagicLinkTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void requestMagicLink(String email) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(TOKEN_VALID_MINUTES, ChronoUnit.MINUTES);
        tokenRepository.save(new MagicLinkToken(email, token, expiresAt));

        String link = "http://localhost:5173/auth/verify?token=" + token;
        System.out.println("MAGIC LINK LOCAL");
        System.out.println(link);
        System.out.println("====================================================");

        emailService.sendMagicLinkEmail(email, link);
    }

    public SecurityContext verifyToken(String token) {
        MagicLinkToken linkToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link invalid."));

        if (!linkToken.isValid()) {
            throw new IllegalArgumentException("Link expirat sau deja folosit.");
        }

        linkToken.setUsed(true);
        tokenRepository.save(linkToken);

        User user = userRepository.findByEmail(linkToken.getEmail())
                .orElseGet(() -> userRepository.save(new User(linkToken.getEmail())));

        return buildContext(user);
    }

    public SecurityContext register(String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            return null;
        }
        String hash = passwordEncoder.encode(rawPassword);
        User user = userRepository.save(new User(email, hash));
        return buildContext(user);
    }

    public SecurityContext login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email incorect sau parolă incorectă."));

        // userii creati doar prin magic link nu au parola
        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Email sau parolă incorectă.");
        }

        return buildContext(user);
    }

    public void setPassword(User currentUser, String newPassword) {
        String hash = passwordEncoder.encode(newPassword);
        currentUser.setPasswordHash(hash);
        userRepository.save(currentUser);
    }

    public void changePassword(User currentUser, String oldPassword, String newPassword) {
        if (currentUser.getPasswordHash() == null
                || !passwordEncoder.matches(oldPassword, currentUser.getPasswordHash())) {
            throw new BadCredentialsException("Parola veche este incorectă.");
        }
        currentUser.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);
    }

    private SecurityContext buildContext(User user) {
        AppUserDetails userDetails = new AppUserDetails(user);
        var authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authToken);
        return context;
    }
}