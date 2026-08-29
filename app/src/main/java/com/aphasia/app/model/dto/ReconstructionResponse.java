package com.aphasia.app.model.dto;

import java.time.Instant;
import java.util.UUID;

public record ReconstructionResponse(
        UUID id,
        String inputText,
        String outputText,
        String modelUsed,
        Instant createdAt,
        boolean isFavorited
) {}
