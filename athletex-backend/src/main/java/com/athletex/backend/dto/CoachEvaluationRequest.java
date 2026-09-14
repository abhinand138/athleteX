package com.athletex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachEvaluationRequest {

    private String coachId;

    @NotBlank(message = "Athlete ID is required")
    private String athleteId;

    private String readinessStatus; // READY, NEEDS_IMPROVEMENT, FATIGUED, INJURY_RISK

    private String coachFeedback;

    @Min(value = 0, message = "Target speed cannot be negative")
    @Max(value = 100, message = "Target speed cannot exceed 100")
    private Double targetSpeed;

    @Min(value = 0, message = "Target strength cannot be negative")
    @Max(value = 100, message = "Target strength cannot exceed 100")
    private Double targetStrength;

    @Min(value = 0, message = "Target endurance cannot be negative")
    @Max(value = 100, message = "Target endurance cannot exceed 100")
    private Double targetEndurance;

    @Min(value = 0, message = "Target agility cannot be negative")
    @Max(value = 100, message = "Target agility cannot exceed 100")
    private Double targetAgility;
}
