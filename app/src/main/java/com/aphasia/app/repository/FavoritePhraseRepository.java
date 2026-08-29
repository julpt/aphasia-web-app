package com.aphasia.app.repository;

import com.aphasia.app.model.entities.FavoritePhrase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FavoritePhraseRepository extends JpaRepository<FavoritePhrase, UUID> {
    List<FavoritePhrase> findByUserIdOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserIdAndText(UUID userId, String text);

    boolean existsByUserIdAndReconstructionId(UUID userId, UUID reconstructionId);

    @Query("select f.reconstructionId from FavoritePhrase f where f.user.id = :userId and f.reconstructionId is not null")
    List<UUID> findFavoritedReconstructionIds(UUID userId);
}
