package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AthleteAttentionDto {

    private String athleteId;
    private String name;
    private String profileImage;
    private String sport;
    private String reason;
    private double performanceScore;
    private double completionRate;
    private String severity; // "HIGH", "MEDIUM"
}
