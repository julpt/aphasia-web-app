package com.aphasia.app.controller;

import com.aphasia.app.model.dto.CreateFavoriteRequest;
import com.aphasia.app.model.dto.FavoritePhraseResponse;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.FavoritePhraseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritePhraseController {

    private final FavoritePhraseService favoriteService;

    @GetMapping
    public List<FavoritePhraseResponse> getFavorites(@AuthenticationPrincipal AppUserDetails currentUser) {
        return favoriteService.getUserFavorites(currentUser.getUser());
    }

    @GetMapping("/api/favorites/reconstruction-ids")
    public Set<UUID> getFavoritedReconstructionIds(@AuthenticationPrincipal User user) {
        return favoriteService.getFavoritedReconstructionIds(user);
    }

    @PostMapping
    public FavoritePhraseResponse addFavorite(@RequestBody CreateFavoriteRequest request,
                                              @AuthenticationPrincipal AppUserDetails currentUser) {
        return favoriteService.addFavorite(request, currentUser.getUser());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable UUID id,
                                               @AuthenticationPrincipal AppUserDetails currentUser) {
        favoriteService.removeFavorite(id, currentUser.getUser());
        return ResponseEntity.noContent().build();
    }
}
