package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRosterResponse {
    private String assignmentId;
    private String coachId;
    private String coachName;
    private String coachEmail;
    private String athleteId;
    private String athleteName;
    private String athleteEmail;
    private String sport;
    private LocalDateTime assignedAt;
    private String status;
}
