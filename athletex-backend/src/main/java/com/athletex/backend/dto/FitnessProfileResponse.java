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

    // Tim Gabbett ACWR (Acute:Chronic Workload Ratio) - Sports Science Engine
    private Double acwr;                     // e.g. 1.15
    private String acwrStatus;               // "SWEET_SPOT", "MODERATE_SPIKE", "DANGER_ZONE", "UNDERTRAINING"
    private String acwrBadge;                // "🟢 Sweet Spot (0.8 - 1.3)", "🟡 Moderate Spike (1.3 - 1.5)", "🔴 High Injury Danger (> 1.5)", "🔵 Under-Stimulated (< 0.8)"
    private String acwrRecommendation;       // Actionable sports science recommendation
    private Double acute7DayLoad;            // Total AU load in past 7 days
    private Double chronic28DayLoad;         // Total AU load in past 28 days
    private Double chronicWeeklyAverageLoad; // chronic28DayLoad / 4.0
    private Double injuryRiskIndex;          // Scaled 0 - 100 injury risk score

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
