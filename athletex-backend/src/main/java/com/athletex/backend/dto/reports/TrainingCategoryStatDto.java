package com.athletex.backend.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingCategoryStatDto {

    private String category;
    private long totalSessions;
    private long completed;
}
