package com.athletex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    private String phone;

    private String sport;

    private String position;

    @Min(value = 5, message = "Age must be at least 5")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;

    private String gender;

    @Positive(message = "Height must be a positive number")
    private Double height;

    @Positive(message = "Weight must be a positive number")
    private Double weight;

    private String city;

    private String state;

    private String country;

    @Size(max = 2000, message = "Biography cannot exceed 2000 characters")
    private String bio;

    private String profileImage;
}