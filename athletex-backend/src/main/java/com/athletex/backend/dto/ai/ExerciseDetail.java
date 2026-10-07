package com.athletex.backend.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDetail {

    private String name;

    private String sets;

    private String repsOrDuration;

    private String restInterval;

    private String coachingNotes;
}
