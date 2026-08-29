package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachInfoResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String sport;
    private String city;
    private String bio;
    private String profileImage;
    private LocalDateTime assignedAt;
}
