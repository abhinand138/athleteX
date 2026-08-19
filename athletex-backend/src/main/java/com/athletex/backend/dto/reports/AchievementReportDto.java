package com.athletex.backend.dto.reports;

import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.analytics.AchievementCategoryCountDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementReportDto {

    private long totalAchievements;
    private long championships;
    private long medals;
    private long records;
    private long milestones;
    private long awards;
    private long other;

    private List<AchievementCategoryCountDto> categoryDistribution;
    private List<AchievementLeaderboardDto> leaderboard;
    private List<AchievementResponse> timeline;
}
