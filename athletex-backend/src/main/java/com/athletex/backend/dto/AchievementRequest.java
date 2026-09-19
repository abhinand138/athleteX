package com.athletex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementRequest {

    private String coachId;

    @NotBlank(message = "Athlete ID is required")
    private String athleteId;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 5, max = 500, message = "Description must be between 5 and 500 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String level;

    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Achievement date cannot be in the future")
    private LocalDate date;

    private String icon;

    @Pattern(regexp = "^(https?://.+)?$", message = "Proof URL must be a valid link starting with http:// or https://")
    private String proofUrl;

    private String proofType;
}
