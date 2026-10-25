package com.athletex.backend.dto.sport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SportWorkloadRequest {

    @NotBlank(message = "Sport is required")
    private String sport; // "CRICKET", "FOOTBALL", "BASKETBALL", "GENERAL"

    @NotNull(message = "Date is required")
    private LocalDate date;

    // Cricket Fast Bowler Inputs
    private Double matchOvers;
    private Double practiceOvers;
    private Double bowlingSpeedKmh;

    // Football Match / GPS Inputs
    private Double totalDistanceKm;
    private Double highSpeedRunningMeters;
    private Double sprintDistanceMeters;
    private Double maxVelocityKmh;
    private Integer accelerationsCount;
    private Integer minutesPlayed;

    // Common Effort
    private Integer rpe; // 1-10
    private String sessionType; // "MATCH", "NETS", "TRAINING", "RECOVERY"
    private String notes;
}
