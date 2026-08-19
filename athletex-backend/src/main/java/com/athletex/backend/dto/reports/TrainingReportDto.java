package com.athletex.backend.dto.reports;

import com.athletex.backend.dto.analytics.MonthlyTrainingDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingReportDto {

    private long totalTrainings;
    private long scheduled;
    private long completed;
    private long cancelled;
    private double completionRate;

    private List<TrainingCategoryStatDto> categoryBreakdown;
    private List<MonthlyTrainingDto> monthlyVolume;
    private List<AthleteTrainingStatDto> athleteTrainingStats;
}
