package com.athletex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkTrainingRequest {

    @NotBlank(message = "Coach ID is required")
    private String coachId;

    @NotEmpty(message = "At least one athlete must be selected")
    private List<String> athleteIds;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotBlank(message = "Time is required")
    private String time;

    @Min(value = 1, message = "Repeat weeks must be at least 1")
    @Max(value = 12, message = "Repeat weeks cannot exceed 12")
    private Integer repeatWeeks;

    /**
     * Optional list of days of week (e.g. ["MONDAY", "WEDNESDAY", "FRIDAY"]).
     */
    private List<String> repeatDays;
}
