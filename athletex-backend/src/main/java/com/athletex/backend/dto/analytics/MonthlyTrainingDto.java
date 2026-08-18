package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrainingDto {

    private String month;
    private long scheduled;
    private long completed;
    private long cancelled;
}
