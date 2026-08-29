package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reconstructions")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reconstruction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String anonToken;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String inputText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String outputText;

    @Column(nullable = false)
    private String modelUsed;

    private String promptingMode;

    @ManyToOne
    @JoinColumn(name = "parent_reconstruction_id")
    private Reconstruction parent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Reconstruction(String inputText, String outputText, String modelUsed) {
        this.inputText = inputText;
        this.outputText = outputText;
        this.modelUsed = modelUsed;
    }
}
