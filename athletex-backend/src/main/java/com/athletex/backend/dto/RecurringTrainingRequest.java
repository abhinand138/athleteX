package com.athletex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class RecurringTrainingRequest {

    @NotBlank(message = "Coach ID is required")
    private String coachId;

    @NotBlank(message = "Athlete ID is required")
    private String athleteId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotBlank(message = "Time is required")
    private String time;

    @NotNull(message = "Repeat weeks count is required")
    @Min(value = 1, message = "Repeat weeks must be at least 1")
    @Max(value = 12, message = "Repeat weeks cannot exceed 12")
    private Integer repeatWeeks;

    /**
     * Optional list of days of the week (e.g., ["MONDAY", "WEDNESDAY", "FRIDAY"]).
     * If empty or null, defaults to repeating on the day-of-week of startDate.
     */
    private List<String> repeatDays;
}
