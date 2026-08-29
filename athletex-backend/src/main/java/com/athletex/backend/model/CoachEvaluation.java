package com.athletex.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coach_evaluations")
public class CoachEvaluation {

    @Id
    private String id;

    private String coachId;

    private String athleteId;

    private String readinessStatus; // READY, NEEDS_IMPROVEMENT, FATIGUED, INJURY_RISK

    private String coachFeedback;

    private Double targetSpeed;

    private Double targetStrength;

    private Double targetEndurance;

    private Double targetAgility;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
