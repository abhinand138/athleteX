package com.athletex.backend.dto;

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
    private Integer sleepQuality;
    private Integer muscleSoreness;
    private Integer energyLevel;
    private String notes;
}
