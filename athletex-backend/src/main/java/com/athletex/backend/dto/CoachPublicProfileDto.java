package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachPublicProfileDto {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String sport;
    private String title;
    private String specialization;
    private Integer experienceYears;
    private String certifications;
    private String city;
    private String state;
    private String country;
    private String bio;
    private String profileImage;

    @JsonProperty("isAssignedToAthlete")
    @Builder.Default
    private boolean isAssignedToAthlete = false;

    @JsonProperty("isHired")
    @Builder.Default
    private boolean isHired = false;

    @Builder.Default
    private Double monthlyRate = 4999.0;

    @Builder.Default
    private Double consultationRate = 1999.0;

    @Builder.Default
    private String currency = "INR";

    @JsonProperty("hired")
    public boolean getHired() {
        return isHired;
    }

    @JsonProperty("assignedToAthlete")
    public boolean getAssignedToAthlete() {
        return isAssignedToAthlete;
    }
}
