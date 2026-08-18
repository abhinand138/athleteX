package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopAthleteDto {

    private int rank;
    private String athleteId;
    private String name;
    private String profileImage;
    private String sport;
    private double performanceScore;
    private double trainingCompletionRate;
    private long achievementCount;
    private String trend; // "UP", "NEUTRAL", "DOWN"
}
