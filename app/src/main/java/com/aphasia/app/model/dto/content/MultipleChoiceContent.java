package com.aphasia.app.model.dto.content;

import java.util.List;

public record MultipleChoiceContent(
        String prompt,
        List<String> options,
        int correctIndex
) implements ExerciseContent {}
