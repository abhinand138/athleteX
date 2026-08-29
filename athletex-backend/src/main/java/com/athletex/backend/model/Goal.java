package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    private String id;

    private String userId;

    private String title;

    private String category; // SPEED, STRENGTH, ENDURANCE, AGILITY, GENERAL

    private Double targetValue;

    private Double currentValue;

    private String unit; // seconds, kg, km, reps, %

    private LocalDate targetDate;

    @Builder.Default
    private boolean completed = false;

    private LocalDateTime createdAt;
}
