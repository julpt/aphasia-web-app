package com.aphasia.app.model.dto;

import java.time.Instant;
import java.util.UUID;

public record FavoritePhraseResponse(UUID id, String text, Instant createdAt,
                                     UUID reconstructionId) {}
