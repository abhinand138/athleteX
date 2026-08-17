package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CoachDashboardResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    
    // Statistics - Currently mocked at 0 as requested
    @Builder.Default
    private int totalAthletes = 0;
    
    @Builder.Default
    private int upcomingTraining = 0;
    
    @Builder.Default
    private double averagePerformance = 0.0;
}
