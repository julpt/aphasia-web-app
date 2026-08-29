package com.aphasia.app.service;

import com.aphasia.app.model.dto.*;
import com.aphasia.app.model.dto.content.*;
import com.aphasia.app.model.entities.Exercise;
import com.aphasia.app.model.entities.ExerciseAttempt;
import com.aphasia.app.model.entities.Role;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.repository.ExerciseAttemptRepository;
import com.aphasia.app.repository.ExerciseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseAttemptRepository attemptRepository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public ExerciseAdminResponse createExercise(CreateExerciseRequest request, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Doar administratorul poate crea exerciții.");
        }

        Map<String, Object> contentWithType = new HashMap<>(request.content());
        contentWithType.put("exercise_type", request.exerciseType());

        ExerciseContent content;
        try {
            content = objectMapper.convertValue(contentWithType, ExerciseContent.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Content invalid pentru '" + request.exerciseType() + "': " + e.getMessage());
        }

        String contentJson = writeJson(content);
        Exercise exercise = new Exercise(request.exerciseType(), request.difficulty(), contentJson, admin);
        Exercise saved = exerciseRepository.save(exercise);

        return new ExerciseAdminResponse(saved.getId(), saved.getExerciseType(), saved.getDifficulty(),
                content, saved.getCreatedAt(), saved.isActive());
    }

    public List<ExercisePublicResponse> listActive() {
        return exerciseRepository.findByIsActiveTrue().stream()
                .map(this::toPublicResponse)
                .toList();
    }

    public ExercisePublicResponse getPublicById(UUID id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercițiul nu există."));
        return toPublicResponse(exercise);
    }

    public AttemptResultResponse submitAttempt(UUID exerciseId, String userAnswer, User user) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercițiul nu există."));

        ExerciseContent content = readContent(exercise);
        boolean correct;
        String correctAnswerDisplay;

        switch (content) {
            case MultipleChoiceContent c -> {
                int selectedIndex;
                try {
                    selectedIndex = Integer.parseInt(userAnswer.trim());
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Alegeți o opțiune");
                }
                correct = selectedIndex == c.correctIndex();
                correctAnswerDisplay = c.options().get(c.correctIndex());
            }
            case FillInBlankContent c -> {
                correct = userAnswer.trim().equalsIgnoreCase(c.correctAnswer().trim());
                correctAnswerDisplay = c.correctAnswer();
            }
            default -> throw new IllegalStateException("Tip de exercitiu necunoscut: " + exercise.getExerciseType());
        }

        if (user != null) {
            attemptRepository.save(new ExerciseAttempt(exercise, user, userAnswer, correct));
        }

        return new AttemptResultResponse(correct, correctAnswerDisplay);
    }


    private ExercisePublicResponse toPublicResponse(Exercise exercise) {
        ExerciseContent content = readContent(exercise);
        Object publicContent = switch (content) {
            case MultipleChoiceContent c -> new MultipleChoicePublic(c.prompt(), c.options());
            case FillInBlankContent c -> new FillInBlankPublic(c.promptWithBlank());
            default -> throw new IllegalStateException("Eroare afisare exercitiu");
        };
        return new ExercisePublicResponse(exercise.getId(), exercise.getExerciseType(),
                exercise.getDifficulty(), publicContent);
    }

    private ExerciseContent readContent(Exercise exercise) {
        try {
            return objectMapper.readValue(exercise.getContent(), ExerciseContent.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Eroare la ex. " + exercise.getId(), e);
        }
    }

    public Optional<ExercisePublicResponse> getRandomByType(String exerciseType, List<UUID> excludeIds) {
        List<Exercise> matches = exerciseRepository.findByExerciseTypeAndIsActiveTrue(exerciseType).stream()
                .filter(e -> !excludeIds.contains(e.getId()))
                .toList();
        if (matches.isEmpty()) {
            return Optional.empty();
        }
        Exercise chosen = matches.get(new java.util.Random().nextInt(matches.size()));
        return Optional.of(toPublicResponse(chosen));
    }

    public List<ExerciseAttemptResponse> getUserAttempts(User user) {
        return attemptRepository.findByUserIdOrderByAttemptedAtDesc(user.getId()).stream()
                .map(a -> new ExerciseAttemptResponse(
                        a.getId(), a.getExercise().getExerciseType(), a.getExercise().getDifficulty(),
                        a.getUserAnswer(), a.isCorrect(), a.getAttemptedAt()
                ))
                .toList();
    }

    public List<ExercisePerDayResponse> getUserDailySummary(User user) {
        List<ExerciseAttempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(user.getId());

        Map<LocalDate, List<ExerciseAttempt>> groupedByDate = attempts.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAttemptedAt().atZone(ZoneId.systemDefault()).toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return groupedByDate.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    List<ExerciseAttempt> dayAttempts = entry.getValue();
                    long correct = dayAttempts.stream().filter(ExerciseAttempt::isCorrect).count();
                    long incorrect = dayAttempts.size() - correct;
                    return new ExercisePerDayResponse(date, dayAttempts.size(), correct, incorrect);
                })
                .toList();
    }

    private String writeJson(ExerciseContent content) {
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
