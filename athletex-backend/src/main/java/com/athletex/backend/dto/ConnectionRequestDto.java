package com.athletex.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectionRequestDto {

    private String athleteId;
    private String coachId;
    private String message;
}
