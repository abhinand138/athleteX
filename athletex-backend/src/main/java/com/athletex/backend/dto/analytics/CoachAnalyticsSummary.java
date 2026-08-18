package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachAnalyticsSummary {

    private int totalAthletes;
    private long activeTrainingSessions;
    private long completedTrainings;
    private long totalAchievements;
    private double averagePerformance;
    private double trainingCompletionRate;
}
