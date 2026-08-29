package com.athletex.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "achievements")
public class Achievement {

    @Id
    private String id;

    private String athleteId;

    private String userId; // Synonymous with athleteId for backward compatibility

    private String coachId;

    private String title;

    private String description;

    private String category;

    private String level;

    private LocalDate date;

    private String icon;

    private Boolean isVerified;

    private String verifiedByCoachId;

    private String verifiedByCoachName;

    private LocalDateTime verifiedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}