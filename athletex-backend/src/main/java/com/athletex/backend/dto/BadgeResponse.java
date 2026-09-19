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
public class BadgeResponse {

    private String id;
    private String title;
    private String description;
    private String icon;
    private String category; // MILESTONE, EXCELLENCE, ENDORSEMENT, STREAK
    private Boolean isUnlocked;
    private LocalDateTime unlockedAt;
    private int progress;
    private int target;
}
