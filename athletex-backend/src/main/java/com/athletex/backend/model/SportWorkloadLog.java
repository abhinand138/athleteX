package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "sport_workload_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SportWorkloadLog {

    @Id
    private String id;

    private String userId;

    private String sport; // "CRICKET", "FOOTBALL", "BASKETBALL", "GENERAL"

    private LocalDate date;

    // --- CRICKET FAST BOWLER WORKLOAD METRICS (Zero hardware required) ---
    private Double matchOvers;        // Overs bowled in official/competitive match
    private Double practiceOvers;     // Overs bowled in nets/training
    private Double totalOvers;        // Total overs (match + practice)
    private Double bowlingSpeedKmh;   // Top speed recorded (radar gun or video)
    private Integer deliveryCount;    // e.g. overs * 6

    // --- FOOTBALL (SOCCER) MATCH & GPS METRICS (From Smartwatch / GPS / Match stats) ---
    private Double totalDistanceKm;        // e.g. 10.4 km
    private Double highSpeedRunningMeters; // HSR (> 19.8 km/h, e.g. 850m)
    private Double sprintDistanceMeters;   // Sprint (> 25.2 km/h, e.g. 280m)
    private Double maxVelocityKmh;         // Top speed e.g. 32.8 km/h
    private Integer accelerationsCount;    // Number of high-intensity accelerations (> 3 m/s²)
    private Integer minutesPlayed;         // Match or training minutes

    // Subjective effort & notes
    private Integer rpe; // 1-10 perceived exertion
    private String sessionType; // "MATCH", "NETS", "TRAINING", "RECOVERY"
    private String notes;
    private LocalDateTime createdAt;
}
