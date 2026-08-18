package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AthleteComparisonDto {

    private String athleteId;
    private String athleteName;
    private String sport;
    private String profileImage;
    private double overallScore;
    private double speed;
    private double strength;
    private double endurance;
    private double agility;
    private double completionRate;
    private long achievementCount;
}
