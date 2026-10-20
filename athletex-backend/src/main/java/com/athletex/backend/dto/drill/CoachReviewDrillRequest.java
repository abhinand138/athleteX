package com.athletex.backend.dto.drill;

import com.athletex.backend.model.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachReviewDrillRequest {

    @NotNull(message = "Review status is required (APPROVED or REJECTED)")
    private VerificationStatus status;

    private String feedback;
}
