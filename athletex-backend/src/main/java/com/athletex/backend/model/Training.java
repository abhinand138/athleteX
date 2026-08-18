package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "trainings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Training {

    @Id
    private String id;

    private String coachId;

    private String athleteId;

    private String title;

    private String description;

    private String category;

    private LocalDate date;

    private String time;

    @Builder.Default
    private TrainingStatus status = TrainingStatus.SCHEDULED;

    private LocalDateTime createdAt;
}
