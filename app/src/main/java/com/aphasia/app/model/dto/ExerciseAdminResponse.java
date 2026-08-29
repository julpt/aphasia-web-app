package com.aphasia.app.model.dto;

import com.aphasia.app.model.dto.content.ExerciseContent;
import java.time.Instant;
import java.util.UUID;

public record ExerciseAdminResponse(UUID id, String exerciseType, String difficulty,
                                    ExerciseContent content, Instant createdAt, boolean isActive) {

}
