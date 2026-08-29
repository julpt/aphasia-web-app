package com.aphasia.app.model.dto;

import java.util.UUID;

public record ReconstructionRequest(
        String inputText,
        String modelKey,
        UUID parentReconstructionId
) {}
