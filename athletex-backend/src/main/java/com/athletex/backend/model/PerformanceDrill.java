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
@Document(collection = "performance_drills")
public class PerformanceDrill {

    @Id
    private String id;

    private String userId;

    private String drillCode; // e.g. "40_YARD_DASH", "VERTICAL_JUMP", "BENCH_PRESS_1RM", "PRO_AGILITY_5105"

    private String drillName; // e.g. "40-Yard Dash"

    private String category; // "SPEED", "STRENGTH", "ENDURANCE", "AGILITY"

    private Double value; // e.g. 4.45

    private String unit; // "s", "in", "cm", "kg", "lbs", "min", "level"

    private Boolean lowerIsBetter; // true for speed/shuttle times, false for jumps/weights

    private Boolean isPersonalRecord; // true if this attempt is currently the user's PR

    private Double percentile; // 0 - 100 estimated percentile against athletic benchmarks

    private String tierBadge; // "Elite", "Pro", "Varsity", "Development"

    private String notes;

    private String proofUrl; // video or activity link (e.g. Strava, YouTube)

    private LocalDateTime recordedAt;

    private Boolean isCoachVerified;

    private VerificationStatus verificationStatus; // APPROVED, PENDING, REJECTED

    private String coachFeedback;

    private LocalDateTime verifiedAt;

    private String verifiedByCoachId;

    private String verifiedByCoachName;
}

