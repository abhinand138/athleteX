package com.athletex.backend.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String password;

    private Role role;

    private String otp;

    @Builder.Default
    private boolean isVerified = false;

    // ==========================
    // Athlete Profile
    // ==========================

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

    // ==========================
    // Coach Profile Additions
    // ==========================

    private String specialization;

    private Integer experienceYears;

    private String certifications;

    private String title;
}