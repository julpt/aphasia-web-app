package com.aphasia.app.controller;

import com.aphasia.app.model.dto.ReconstructionResponse;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.ReconstructionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReconstructionHistoryController {

    private final ReconstructionService reconstructionService;

    @GetMapping("/reconstructions/mine")
    public List<ReconstructionResponse> myHistory(@AuthenticationPrincipal AppUserDetails userDetails) {
        return reconstructionService.getUserReconstructions(userDetails.getUser());
    }

    @DeleteMapping("/reconstructions/{id}")
    public void deleteOne(@PathVariable UUID id, @AuthenticationPrincipal AppUserDetails currentUser) {
        reconstructionService.deleteReconstruction(id, currentUser.getUser());
    }
}
