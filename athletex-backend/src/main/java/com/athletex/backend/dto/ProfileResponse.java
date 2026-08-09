package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

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
}