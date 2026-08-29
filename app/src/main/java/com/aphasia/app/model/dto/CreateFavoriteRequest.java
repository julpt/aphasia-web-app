package com.aphasia.app.model.dto;

import java.util.UUID;

public record CreateFavoriteRequest(String text, UUID reconstructionId) {}
