package com.aphasia.app.repository;

import com.aphasia.app.model.entities.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, UUID> {
    List<ExerciseAttempt> findByUserIdOrderByAttemptedAtDesc(UUID userId);
}
