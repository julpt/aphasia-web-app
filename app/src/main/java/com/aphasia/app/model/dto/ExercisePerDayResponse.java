package com.aphasia.app.model.dto;

import java.time.LocalDate;

public record ExercisePerDayResponse(LocalDate date, long totalAttempts,
                                     long correctCount, long incorrectCount) {
}
