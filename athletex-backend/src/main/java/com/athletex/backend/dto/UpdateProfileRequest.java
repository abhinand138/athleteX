package com.athletex.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    private String fullName;

    private String phone;

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
}