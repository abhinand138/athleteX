package com.athletex.backend.dto.drill;

import com.athletex.backend.model.PerformanceDrill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CombineSummaryResponse {

    private String userId;

    private int totalAttempts;

    private int personalRecordsCount;

    private List<PersonalRecordDto> personalRecords;

    private List<PerformanceDrill> recentAttempts;

    // Suggested 0-100 scores derived from PRs against benchmarks: {speed, strength, endurance, agility, overall}
    private Map<String, Double> benchmarkScores;
}
