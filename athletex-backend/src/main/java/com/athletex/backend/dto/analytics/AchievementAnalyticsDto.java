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
public class AchievementAnalyticsDto {

    private long totalAchievements;
    private long championships;
    private long medals;
    private long records;
    private long milestones;
    private long awards;
    private long other;
    private List<AchievementCategoryCountDto> distribution;
}
