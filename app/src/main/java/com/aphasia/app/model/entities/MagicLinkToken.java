package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "magic_link_tokens")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MagicLinkToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public MagicLinkToken(String email, String token, Instant expiresAt) {
        this.email = email;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public boolean isValid() {
        return !used && Instant.now().isBefore(expiresAt);
    }
}
