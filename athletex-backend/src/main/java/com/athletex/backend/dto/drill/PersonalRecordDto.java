package com.athletex.backend.dto.drill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalRecordDto {

    private String drillCode;

    private String drillName;

    private String category; // "SPEED", "STRENGTH", "ENDURANCE", "AGILITY"

    private Double bestValue;

    private String unit;

    private Boolean lowerIsBetter;

    private LocalDateTime achievedAt;

    private Double previousBest;

    private Integer attemptCount;

    private Double percentile; // 0-100 benchmark percentile

    private String tierBadge; // e.g. "Elite", "Pro", "Varsity", "Development"

    private Boolean isCoachVerified;

    private com.athletex.backend.model.VerificationStatus verificationStatus;

    private String coachFeedback;

    private LocalDateTime verifiedAt;

    private String verifiedByCoachName;

    private String proofUrl;

    private String latestRecordId;
}
