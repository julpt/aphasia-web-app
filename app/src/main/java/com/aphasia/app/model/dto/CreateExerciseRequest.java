package com.aphasia.app.model.dto;

import java.util.Map;

public record CreateExerciseRequest(String exerciseType, String difficulty, Map<String, Object> content) {}
