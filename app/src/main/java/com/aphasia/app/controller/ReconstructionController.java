package com.aphasia.app.controller;

import com.aphasia.app.model.dto.ReconstructionRequest;
import com.aphasia.app.model.dto.ReconstructionResponse;
import com.aphasia.app.security.AppUserDetails;
import com.aphasia.app.service.ReconstructionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReconstructionController {

    private final ReconstructionService service;

    @PostMapping("/reconstruct")
    public ReconstructionResponse reconstruct(@RequestBody ReconstructionRequest request,
                                              @AuthenticationPrincipal AppUserDetails currentUser) {
        return service.reconstruct(request, currentUser);
    }
}
