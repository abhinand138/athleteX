package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachEvaluationResponse {

    private String id;
    private String coachId;
    private String coachName;
    private String athleteId;
    private String readinessStatus;
    private String coachFeedback;
    private Double targetSpeed;
    private Double targetStrength;
    private Double targetEndurance;
    private Double targetAgility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
