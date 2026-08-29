package com.aphasia.app.model.dto;

import java.time.Instant;
import java.util.UUID;

public record ExerciseAttemptResponse(UUID id, String exerciseType, String difficulty,
                                      String userAnswer, boolean correct, Instant attemptedAt) {}
