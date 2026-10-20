package com.athletex.backend.dto.drill;

import com.athletex.backend.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingDrillReviewResponse {

    private String drillId;

    private String athleteId;

    private String athleteName;

    private String athleteImage;

    private String athleteSport;

    private String drillCode;

    private String drillName;

    private String category;

    private Double value;

    private String unit;

    private Boolean lowerIsBetter;

    private Double percentile;

    private String tierBadge;

    private String proofUrl;

    private String notes;

    private LocalDateTime recordedAt;

    private Boolean isPersonalRecord;

    private VerificationStatus verificationStatus;

    private String coachFeedback;
}
