package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long totalAthletes;
    private long totalCoaches;
    private long totalAdmins;
    private long totalTrainings;
    private long totalAchievements;
    private long totalAssignments;
}
