package com.athletex.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "performances")
public class Performance {

    @Id
    private String id;

    private String userId;

    private Double speed;

    private Double strength;

    private Double endurance;

    private Double agility;

    private Double overallScore;

    private LocalDateTime lastUpdated;
}