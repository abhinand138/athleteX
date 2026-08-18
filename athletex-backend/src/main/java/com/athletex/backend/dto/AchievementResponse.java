package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementResponse {

    private String id;
    private String athleteId;
    private String athleteName;
    private String coachId;
    private String coachName;
    private String title;
    private String description;
    private String category;
    private String level;
    private LocalDate date;
    private String icon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
