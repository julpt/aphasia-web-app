package com.aphasia.app.model.dto.content;


public record FillInBlankContent(
        String promptWithBlank,
        String correctAnswer
) implements ExerciseContent {}
