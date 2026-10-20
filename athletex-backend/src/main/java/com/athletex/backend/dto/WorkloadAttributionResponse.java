package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkloadAttributionResponse {

    private String userId;

    private int totalCompletedWorkouts;

    private double totalTrainingLoadAU;

    private int windowDays;

    private double consistencyPercentage;

    private Map<String, CategoryMetric> categoryMetrics;

    private String nextWorkoutImpact;

    private String nextWorkoutTitle;

    private Double potentialScoreGain;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryMetric {
        private String category;
        private int sessionsCount;
        private double totalLoadAU;
        private Integer lastTrainedDaysAgo;
        private double score;
        private String status; // "Peaking", "Building", "Maintaining", "Detraining"
    }
}
