package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "wellness_checkins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WellnessCheckin {

    @Id
    private String id;

    private String userId;

    private Integer sleepQuality; // 1 to 5

    private Integer muscleSoreness; // 1 (None) to 5 (Severe)

    private Integer energyLevel; // 1 (Exhausted) to 5 (Peak)

    private Integer readinessScore; // 0 to 100 percentage

    private String notes;

    private LocalDate date;

    private LocalDateTime createdAt;
}
