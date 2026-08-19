package com.athletex.backend.dto.reports;

import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.analytics.PerformanceTrendPoint;
import com.athletex.backend.dto.analytics.RecentActivityDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndividualAthleteReportDto {

    // Athlete Profile
    private String athleteId;
    private String athleteName;
    private String email;
    private String phone;
    private String profileImage;
    private Integer age;
    private String gender;
    private String sport;
    private String position;
    private Double height;
    private Double weight;
    private String city;
    private String state;
    private String country;
    private String bio;
    private String coachName;

    // Performance Summary
    private double overallScore;
    private double speed;
    private double strength;
    private double endurance;
    private double agility;
    private double previousScore;
    private double changePercentage;
    private String trend; // "UP", "NEUTRAL", "DOWN"

    // Performance Progression History
    private List<PerformanceTrendPoint> progressionHistory;

    // Training Summary
    private long totalTrainings;
    private long completedTrainings;
    private long scheduledTrainings;
    private long cancelledTrainings;
    private double trainingCompletionRate;

    // Achievement Summary
    private long totalAchievements;
    private long championships;
    private long medals;
    private long records;
    private long milestones;
    private long awards;
    private long otherAchievements;
    private List<AchievementResponse> achievementsList;

    // Recent Activity
    private List<RecentActivityDto> recentActivities;
}
