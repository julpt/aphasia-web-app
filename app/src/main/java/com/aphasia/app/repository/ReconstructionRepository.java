package com.aphasia.app.repository;

import com.aphasia.app.model.entities.Reconstruction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReconstructionRepository extends JpaRepository<Reconstruction, UUID> {
    List<Reconstruction> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
