package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {

    private String userId;
    private String title;
    private String category;
    private Double targetValue;
    private Double currentValue;
    private String unit;
    private LocalDate targetDate;
    private Boolean completed;
}
