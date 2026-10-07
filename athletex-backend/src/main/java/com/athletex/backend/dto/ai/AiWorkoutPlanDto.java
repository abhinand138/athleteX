package com.athletex.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiWorkoutPlanDto {

    private String title;

    private String summary;

    private String sport;

    private String focusArea;

    private String targetIntensity;

    private Integer totalDurationMinutes;

    private Integer estimatedCaloriesBurned;

    private List<ExerciseDetail> warmupExercises;

    private List<ExerciseDetail> mainDrills;

    private List<ExerciseDetail> cooldownExercises;

    private String aiCoachTip;
}
