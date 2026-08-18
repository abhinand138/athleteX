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
public class TrainingAnalyticsDto {

    private long totalTrainings;
    private long scheduled;
    private long completed;
    private long cancelled;
    private double completionRate;
    private List<MonthlyTrainingDto> monthlyDistribution;
}
