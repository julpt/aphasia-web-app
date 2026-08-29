package com.aphasia.app.repository;

import com.aphasia.app.model.entities.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByIsActiveTrue();
    List<Exercise> findByExerciseTypeAndIsActiveTrue(String exerciseType);
}
