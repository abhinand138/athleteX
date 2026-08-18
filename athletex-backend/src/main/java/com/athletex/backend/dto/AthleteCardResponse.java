package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AthleteCardResponse {
    private String id;
    private String fullName;
    private String email;
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
    private String assignmentId;
}
