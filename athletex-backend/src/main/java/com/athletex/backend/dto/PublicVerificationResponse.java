package com.athletex.backend.dto;

import com.athletex.backend.model.Achievement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicVerificationResponse {

    private String athleteId;
    private String fullName;
    private String email;
    private String phone;
    private String profileImage;

    private String sport;
    private String position;
    private String city;
    private String state;
    private String country;
    private String bio;

    private Integer age;
    private String gender;
    private Double height;
    private Double weight;

    // Performance Ratings
    private Double overallScore;
    private Double speed;
    private Double strength;
    private Double endurance;
    private Double agility;

    // Verification Seal Data
    private String verificationStatus; // e.g. "OFFICIALLY VERIFIED"
    private int totalVerifiedAchievements;
    private List<AchievementResponse> verifiedAchievements;
}
