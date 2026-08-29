package com.athletex.backend.dto;

import com.athletex.backend.model.TrainingStatus;
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
public class TrainingResponse {

    private String id;
    private String coachId;
    private String coachName;
    private String athleteId;
    private String athleteName;
    private String title;
    private String description;
    private String category;
    private LocalDate date;
    private String time;
    private TrainingStatus status;
    private Integer rpe;
    private Integer actualDurationMinutes;
    private String athleteFeedback;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
