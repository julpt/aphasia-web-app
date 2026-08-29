package com.aphasia.app.mapper;

import com.aphasia.app.model.dto.ReconstructionResponse;
import com.aphasia.app.model.entities.Reconstruction;
import org.springframework.stereotype.Component;

@Component
public class ReconstructionMapper {

    public ReconstructionResponse toResponse(Reconstruction r) {
        return toResponse(r, false);
    }

    public ReconstructionResponse toResponse(Reconstruction r, boolean isFavorited) {
        return new ReconstructionResponse(
                r.getId(), r.getInputText(), r.getOutputText(), r.getModelUsed(), r.getCreatedAt(), isFavorited
        );
    }
}
