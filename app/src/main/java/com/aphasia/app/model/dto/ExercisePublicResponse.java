package com.aphasia.app.model.dto;

import java.util.UUID;

public record ExercisePublicResponse(UUID id, String exerciseType, String difficulty, Object content) {
}
