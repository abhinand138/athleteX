package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessProfileResponse {

    private String userId;

    // Banister Fitness & Freshness Model
    private double fitnessScore; // Chronic Conditioning (0-100)
    private double fatigueScore; // Acute Fatigue (0-100)
    private double formScore;    // Training Stress Balance (Fitness - Fatigue)
    private String formStatus;   // "PEAK_MATCH_FITNESS", "OPTIMAL_TRAINING", "HEAVY_FATIGUE", "RECOVERY_NEEDED"
    private String formBadge;    // Label with emoji
    private String formDescription;
    private String fitnessTier;  // "ELITE_DIVISION", "SEMI_PRO", "VARSITY", "DEVELOPMENT"

    // 5 Pillars (0-100)
    private double speed;
    private double strength;
    private double endurance;
    private double agility;
    private double consistency;
    private double overallFitnessScore;

    // Pre-formatted for Recharts RadarChart
    private List<RadarPillarItem> radarData;

    // Pre-formatted for 14-day Banister Trend Chart
    private List<FitnessTrendItem> trendData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarPillarItem {
        private String pillar;
        private double value;
        private double benchmark;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FitnessTrendItem {
        private String date;
        private double fitness;
        private double fatigue;
        private double form;
    }
}
