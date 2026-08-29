package com.aphasia.app.mapper;

import com.aphasia.app.model.dto.FavoritePhraseResponse;
import com.aphasia.app.model.entities.FavoritePhrase;
import org.springframework.stereotype.Component;

@Component
public class FavoritePhraseMapper {

    public FavoritePhraseResponse toResponse(FavoritePhrase entity) {
        return new FavoritePhraseResponse(
                entity.getId(),
                entity.getText(),
                entity.getCreatedAt(),
                entity.getReconstructionId()
        );
    }
}
