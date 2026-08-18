package com.athletex.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {

    private String id;
    private String athleteId;
    private String athleteName;
    private String type;
    private String title;
    private String description;
    private String icon;
    private LocalDateTime timestamp;
}
