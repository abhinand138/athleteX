package com.athletex.backend.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementLeaderboardDto {

    private int rank;
    private String athleteId;
    private String athleteName;
    private String sport;
    private long totalAchievements;
    private long records;
    private long awards;
}
