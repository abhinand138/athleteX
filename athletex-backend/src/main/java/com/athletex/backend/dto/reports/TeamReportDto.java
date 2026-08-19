package com.athletex.backend.dto.reports;

import com.athletex.backend.dto.analytics.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamReportDto {

    private CoachAnalyticsSummary teamSummary;
    private List<TopAthleteDto> athleteRankings;
    private List<CategoryAnalysisDto> categoryAverages;
    private TrainingAnalyticsDto trainingDistribution;
    private AchievementAnalyticsDto achievementDistribution;
}
