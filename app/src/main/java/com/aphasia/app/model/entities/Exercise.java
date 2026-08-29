package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String exerciseType;

    @Column(nullable = false)
    private String difficulty;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String content;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private boolean isActive = true;

    public Exercise(String exerciseType, String difficulty, String content, User createdBy) {
        this.exerciseType = exerciseType;
        this.difficulty = difficulty;
        this.content = content;
        this.createdBy = createdBy;
    }
}
