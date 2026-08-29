package com.athletex.backend.dto;

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

    private Double targetSpeed;

    private Double targetStrength;

    private Double targetEndurance;

    private Double targetAgility;
}
