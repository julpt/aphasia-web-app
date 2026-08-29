package com.aphasia.app.controller;

import com.aphasia.app.model.dto.*;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    public List<ExercisePublicResponse> listAll() {
        return exerciseService.listActive();
    }

    @GetMapping("/{id}")
    public ExercisePublicResponse getOne(@PathVariable UUID id) {
        return exerciseService.getPublicById(id);
    }

    @PostMapping("/{id}/attempts")
    public AttemptResultResponse submitAttempt(@PathVariable UUID id,
                                               @RequestBody SubmitAttemptRequest request,
                                               @AuthenticationPrincipal AppUserDetails currentUser) {
        User user = currentUser != null ? currentUser.getUser() : null;
        return exerciseService.submitAttempt(id, request.answer(), user);
    }

    @GetMapping("/random")
    public ResponseEntity<ExercisePublicResponse> randomByType(
            @RequestParam String type,
            @RequestParam(required = false) List<UUID> exclude) {
        Optional<ExercisePublicResponse> result =
                exerciseService.getRandomByType(type, exclude == null ? List.of() : exclude);
        return result.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/attempts/mine")
    public List<ExerciseAttemptResponse> userAttempts(@AuthenticationPrincipal AppUserDetails currentUser) {
        return exerciseService.getUserAttempts(currentUser.getUser());
    }

    @GetMapping("/attempts/daily-summary")
    public List<ExercisePerDayResponse> getDailySummary(@AuthenticationPrincipal AppUserDetails currentUser) {
        return exerciseService.getUserDailySummary(currentUser.getUser());
    }
}