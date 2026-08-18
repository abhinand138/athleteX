package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceTrendPoint {

    private String date;
    private String athleteId;
    private String athleteName;
    private double score;
    private double speed;
    private double strength;
    private double endurance;
    private double agility;
}
