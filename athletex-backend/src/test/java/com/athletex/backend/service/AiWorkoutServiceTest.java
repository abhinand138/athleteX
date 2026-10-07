package com.athletex.backend.service;

import com.athletex.backend.dto.ai.AiWorkoutPlanDto;
import com.athletex.backend.dto.ai.AiWorkoutRequest;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.Training;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiWorkoutServiceTest {

    @Mock
    private TrainingRepository trainingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AiWorkoutService aiWorkoutService;

    private User athlete;

    @BeforeEach
    void setUp() {
        athlete = User.builder()
                .id("athlete_123")
                .fullName("Sarah Sprint")
                .email("sarah@athlete.com")
                .role(Role.ATHLETE)
                .sport("Track & Field")
                .build();
    }

    @Test
    @DisplayName("Should generate structured AI Workout Plan for Sprint & Explosive Speed focus")
    void generateWorkout_SprintFocus() {
        AiWorkoutRequest request = AiWorkoutRequest.builder()
                .sport("Sprint 100m")
                .focusArea("Explosive Speed")
                .intensity("ADVANCED")
                .durationMinutes(45)
                .build();

        AiWorkoutPlanDto plan = aiWorkoutService.generateWorkout(request);

        assertNotNull(plan);
        assertTrue(plan.getTitle().contains("AI Explosive Speed Program"));
        assertEquals("Sprint 100m", plan.getSport());
        assertEquals(45, plan.getTotalDurationMinutes());
        assertTrue(plan.getEstimatedCaloriesBurned() > 300);

        assertNotNull(plan.getWarmupExercises());
        assertFalse(plan.getWarmupExercises().isEmpty());

        assertNotNull(plan.getMainDrills());
        assertFalse(plan.getMainDrills().isEmpty());

        assertNotNull(plan.getCooldownExercises());
        assertFalse(plan.getCooldownExercises().isEmpty());

        assertNotNull(plan.getAiCoachTip());
    }

    @Test
    @DisplayName("Should generate strength focus AI program with deadlifts and plyometrics")
    void generateWorkout_StrengthFocus() {
        AiWorkoutRequest request = AiWorkoutRequest.builder()
                .sport("Football")
                .focusArea("Strength & Power")
                .intensity("ELITE")
                .durationMinutes(60)
                .build();

        AiWorkoutPlanDto plan = aiWorkoutService.generateWorkout(request);

        assertNotNull(plan);
        assertEquals("Football", plan.getSport());
        assertEquals(60, plan.getTotalDurationMinutes());
        assertTrue(plan.getMainDrills().stream().anyMatch(d -> d.getName().toLowerCase().contains("deadlift") || d.getName().toLowerCase().contains("squat")));
    }

    @Test
    @DisplayName("Should convert and assign AI workout plan to roster athlete in database")
    void assignAiWorkoutToAthlete_Success() {
        AiWorkoutPlanDto planDto = AiWorkoutPlanDto.builder()
                .title("AI Explosive Speed Program")
                .focusArea("Explosive Speed")
                .targetIntensity("ADVANCED")
                .estimatedCaloriesBurned(428)
                .totalDurationMinutes(45)
                .aiCoachTip("Maintain dynamic recovery between reps.")
                .build();

        when(userRepository.findById("athlete_123")).thenReturn(Optional.of(athlete));

        Training mockSavedTraining = Training.builder()
                .id("train_999")
                .coachId("coach_888")
                .athleteId("athlete_123")
                .title("AI Explosive Speed Program")
                .build();

        when(trainingRepository.save(any(Training.class))).thenReturn(mockSavedTraining);

        Training result = aiWorkoutService.assignAiWorkoutToAthlete("coach_888", "athlete_123", planDto);

        assertNotNull(result);
        assertEquals("train_999", result.getId());
        assertEquals("athlete_123", result.getAthleteId());
        verify(trainingRepository, times(1)).save(any(Training.class));
        verify(notificationService, times(1)).sendNotification(eq("athlete_123"), anyString(), anyString(), eq("TRAINING"), anyString());
    }
}
