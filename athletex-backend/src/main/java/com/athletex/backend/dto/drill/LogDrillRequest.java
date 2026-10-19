package com.athletex.backend.dto.drill;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogDrillRequest {

    @NotBlank(message = "Drill code is required")
    private String drillCode;

    @NotBlank(message = "Drill name is required")
    private String drillName;

    @NotBlank(message = "Category is required")
    private String category; // "SPEED", "STRENGTH", "ENDURANCE", "AGILITY"

    @NotNull(message = "Value is required")
    @Positive(message = "Value must be positive")
    private Double value;

    @NotBlank(message = "Unit is required")
    private String unit;

    private Boolean lowerIsBetter; // default true for speed/shuttle, false otherwise

    private String notes;

    private String proofUrl;

    private LocalDateTime recordedAt;
}
