package com.aphasia.app.model.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "exercise_attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String userAnswer;

    @Column(nullable = false)
    private boolean isCorrect;

    @Column(nullable = false, updatable = false)
    private Instant attemptedAt = Instant.now();

    public ExerciseAttempt(Exercise exercise, User user, String userAnswer, boolean isCorrect) {
        this.exercise = exercise;
        this.user = user;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect;
    }
}
