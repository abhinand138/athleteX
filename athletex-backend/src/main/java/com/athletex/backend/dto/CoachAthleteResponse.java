package com.athletex.backend.dto;

import com.athletex.backend.model.Achievement;
import com.athletex.backend.model.PerformanceHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachAthleteResponse {

    // Basic Information
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String profileImage;

    // Sports Information
    private String sport;
    private String position;

    // Personal Information
    private Integer age;
    private String gender;

    // Physical Information
    private Double height;
    private Double weight;

    // Location
    private String city;
    private String state;
    private String country;

    // Bio
    private String bio;

    // Performance Metrics
    private Double overallScore;
    private Double speed;
    private Double strength;
    private Double endurance;
    private Double agility;

    // Achievements
    private List<Achievement> achievements;

    // Performance History
    private List<PerformanceHistory> performanceHistory;
}
