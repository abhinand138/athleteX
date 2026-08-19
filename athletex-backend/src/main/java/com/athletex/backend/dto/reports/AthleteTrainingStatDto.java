package com.athletex.backend.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AthleteTrainingStatDto {

    private String athleteId;
    private String athleteName;
    private String sport;
    private long totalSessions;
    private long completed;
    private long scheduled;
    private long cancelled;
    private double completionRate;
}
