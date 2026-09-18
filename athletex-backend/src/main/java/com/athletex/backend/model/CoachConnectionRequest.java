package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "coach_connection_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachConnectionRequest {

    @Id
    private String id;

    private String athleteId;
    private String athleteName;
    private String athleteSport;
    private String coachId;
    private String coachName;

    private String message;

    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, DECLINED

    private LocalDateTime createdAt;
}
