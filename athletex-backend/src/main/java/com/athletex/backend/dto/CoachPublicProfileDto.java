package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
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

    @Builder.Default
    private boolean isAssignedToAthlete = false;
}
