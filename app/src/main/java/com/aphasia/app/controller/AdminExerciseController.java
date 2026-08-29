package com.aphasia.app.controller;

import com.aphasia.app.model.dto.CreateExerciseRequest;
import com.aphasia.app.model.dto.ExerciseAdminResponse;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/exercises")
@RequiredArgsConstructor
public class AdminExerciseController {

    private final ExerciseService exerciseService;

    @PostMapping
    public ExerciseAdminResponse create(
            @RequestBody CreateExerciseRequest request,
            @AuthenticationPrincipal AppUserDetails currentUser
    ) {
        return exerciseService.createExercise(request, currentUser.getUser());
    }
}
