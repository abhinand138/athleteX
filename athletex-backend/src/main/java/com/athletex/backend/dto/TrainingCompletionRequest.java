package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingCompletionRequest {

    private String userId;

    private Integer rpe; // Rating of Perceived Exertion (1-10)

    private Integer actualDurationMinutes;

    private String athleteFeedback;
}
