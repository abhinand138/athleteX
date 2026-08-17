package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "performance_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceHistory {

    @Id
    private String id;

    private String userId;

    private Double speed;

    private Double strength;

    private Double endurance;

    private Double agility;

    private Double overallScore;

    private LocalDateTime recordedAt;
}
