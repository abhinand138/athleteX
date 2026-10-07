package com.athletex.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiWorkoutRequest {

    private String athleteId;

    private String sport; // e.g. Sprint, Football, Basketball, Swimming, Tennis

    private String focusArea; // e.g. Explosive Speed, Aerobic Endurance, Strength & Power, Mobility & Recovery

    private String intensity; // BEGINNER, INTERMEDIATE, ADVANCED, ELITE

    @Builder.Default
    private Integer durationMinutes = 45;
}
