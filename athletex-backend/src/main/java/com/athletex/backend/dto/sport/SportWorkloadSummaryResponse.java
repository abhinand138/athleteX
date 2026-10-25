package com.athletex.backend.dto.sport;

import com.athletex.backend.model.SportWorkloadLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SportWorkloadSummaryResponse {

    private String userId;
    private String primarySport;

    // --- CRICKET FAST BOWLER WORKLOAD METRICS ---
    private Double acute7DayOvers;           // Total overs bowled in last 7 days
    private Double chronic28DayWeeklyOvers;  // Weekly average overs over 28-day window
    private Double bowlingAcwr;              // Acute-to-Chronic Bowling Ratio
    private String lumbarStressStatus;       // "OPTIMAL_LOAD", "MODERATE_BUILDUP", "CRITICAL_LUMBAR_RISK", "UNDERTRAINED"
    private String lumbarStressBadge;        // "🟢 Safe Workload Zone", "🟡 Elevated Lumbar Strain", "🔴 High Bone Stress Risk", "🔵 Low Volume"
    private String lumbarRecommendation;     // Clinical guideline derived from Cricket Australia & ECB fast bowling protocols
    private Double peakBowlingSpeedKmh;      // Max recorded bowling velocity
    private String maxRecommendedOversToday; // Daily bowling restriction cap

    // --- FOOTBALL (SOCCER) MATCH & GPS LOAD METRICS ---
    private Double totalDistanceWeeklyKm;    // Total match & training distance past 7 days
    private Double highSpeedRunningWeeklyM;  // HSR past 7 days (> 19.8 km/h)
    private Double sprintDistanceWeeklyM;    // Sprint past 7 days (> 25.2 km/h)
    private Double peakMatchVelocityKmh;     // Maximum velocity exposure
    private Integer totalMatchMinutesWeekly; // Weekly competitive minutes
    private Double hsrPercentageOfDistance;  // HSR % of total distance (Pro standard: 8-12%)
    private String footballLoadStatus;       // "MATCH_FIT", "OPTIMAL_LOAD", "OVERLOAD_WARNING", "DELOAD"
    private String footballLoadBadge;
    private String footballRecommendation;

    // Recent session logs
    private List<SportWorkloadLog> recentLogs;
}
