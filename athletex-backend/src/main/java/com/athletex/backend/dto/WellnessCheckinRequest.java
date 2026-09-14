package com.athletex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WellnessCheckinRequest {

    private String userId;

    @NotNull(message = "Sleep quality rating is required")
    @Min(value = 1, message = "Sleep quality must be between 1 and 5")
    @Max(value = 5, message = "Sleep quality must be between 1 and 5")
    private Integer sleepQuality;

    @NotNull(message = "Muscle soreness rating is required")
    @Min(value = 1, message = "Muscle soreness must be between 1 and 5")
    @Max(value = 5, message = "Muscle soreness must be between 1 and 5")
    private Integer muscleSoreness;

    @NotNull(message = "Energy level rating is required")
    @Min(value = 1, message = "Energy level must be between 1 and 5")
    @Max(value = 5, message = "Energy level must be between 1 and 5")
    private Integer energyLevel;

    private String notes;
}
