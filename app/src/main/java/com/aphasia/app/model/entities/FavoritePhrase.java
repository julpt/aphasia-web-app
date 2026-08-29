package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "favorite_phrases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoritePhrase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "reconstruction_id")
    private UUID reconstructionId;

    public FavoritePhrase(User user, String text, UUID reconstructionId, Instant createdAt) {
        this.user = user;
        this.text = text;
        this.reconstructionId = reconstructionId;
        this.createdAt = createdAt;
    }

    public FavoritePhrase(User user, String text, UUID reconstructionId) {
        this.user = user;
        this.text = text;
        this.reconstructionId = reconstructionId;
    }

    public FavoritePhrase(User user, String text) {
        this.user = user;
        this.text = text;
    }
}
