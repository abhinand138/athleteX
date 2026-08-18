package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachAnalyticsResponse {

    private CoachAnalyticsSummary summary;
    private List<PerformanceTrendPoint> performanceTrends;
    private List<CategoryAnalysisDto> categoryAnalysis;
    private TrainingAnalyticsDto trainingAnalytics;
    private AchievementAnalyticsDto achievementAnalytics;
    private List<TopAthleteDto> topAthletes;
    private List<AthleteAttentionDto> athletesNeedingAttention;
    private List<RecentActivityDto> recentActivity;
    private List<RosterAthleteOptionDto> assignedAthletesList;
}
