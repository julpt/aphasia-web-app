package com.aphasia.app.service;

import com.aphasia.app.mapper.FavoritePhraseMapper;
import com.aphasia.app.model.dto.CreateFavoriteRequest;
import com.aphasia.app.model.dto.FavoritePhraseResponse;
import com.aphasia.app.model.entities.FavoritePhrase;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.repository.FavoritePhraseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoritePhraseService {

    private final FavoritePhraseRepository favoriteRepository;
    private final FavoritePhraseMapper favoriteMapper;

    public List<FavoritePhraseResponse> getUserFavorites(User user) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(favoriteMapper::toResponse)
                .toList();
    }

    public Set<UUID> getFavoritedReconstructionIds(User user) {
        return new HashSet<>(favoriteRepository.findFavoritedReconstructionIds(user.getId()));
    }

    @Transactional
    public FavoritePhraseResponse addFavorite(CreateFavoriteRequest request, User user) {
        if (request.text() == null || request.text().trim().isEmpty()) {
            throw new IllegalArgumentException("Textul nu poate fi gol.");
        }
        String cleanText = request.text().trim();
        UUID reconstructionId = request.reconstructionId();

        boolean exists = reconstructionId != null
                ? favoriteRepository.existsByUserIdAndReconstructionId(user.getId(), reconstructionId)
                : favoriteRepository.existsByUserIdAndText(user.getId(), cleanText);
        if (exists) throw new IllegalArgumentException("Fraza există deja în favorite.");

        FavoritePhrase saved = favoriteRepository.saveAndFlush(new FavoritePhrase(user, cleanText, reconstructionId));
        return favoriteMapper.toResponse(saved);
    }


    @Transactional
    public void removeFavorite(UUID id, User user) {
        FavoritePhrase phrase = favoriteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraza nu a fost găsită."));

        if (!phrase.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nu ai permisiunea necesară.");
        }

        favoriteRepository.delete(phrase);
    }
}
