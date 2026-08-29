package com.aphasia.app.model.dto.content;

public record VerbConjugationContent(
        String verbInfinitive,
        String person,
        String tense,
        String correctAnswer
) implements ExerciseContent {}
