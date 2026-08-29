package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;


    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;


    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant deletedAt;

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }
    public User(String email) {
        this.email = email;
    }
}
