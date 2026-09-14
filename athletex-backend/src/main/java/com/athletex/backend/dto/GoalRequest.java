package com.athletex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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

    @NotBlank(message = "Goal title is required")
    private String title;

    private String category;

    @Positive(message = "Target value must be greater than 0")
    private Double targetValue;

    private Double currentValue;
    private String unit;
    private LocalDate targetDate;
    private Boolean completed;
}
