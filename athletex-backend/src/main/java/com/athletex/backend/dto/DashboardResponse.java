package com.athletex.backend.dto;

import java.util.List;

import com.athletex.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor


public class DashboardResponse {

    private String id;

    private String fullName;
    private String email;
    private String phone;

    private Role role;

    private String sport;
    private String position;

    private Integer age;
    private String gender;

    private Double height;
    private Double weight;

    private String city;
    private String state;
    private String country;

    private String bio;
    private String profileImage;

    

    // Temporary dashboard statistics
    private Integer performance;
    private Integer achievements;
    private Integer scoutsViewed;
    private Integer trainingSessions;

    private List<ActivityItem> recentActivities;

    private List<TrainingItem> upcomingTraining;
}