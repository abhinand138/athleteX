package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "coach_athlete_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachAthleteAssignment {

    @Id
    private String id;

    private String coachId;

    private String athleteId;

    private LocalDateTime assignedAt;

    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.ACTIVE;
}
