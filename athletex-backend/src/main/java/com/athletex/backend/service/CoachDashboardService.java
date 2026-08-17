package com.athletex.backend.service;

import com.athletex.backend.dto.CoachDashboardResponse;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CoachDashboardService {

    private final UserRepository userRepository;

    public CoachDashboardResponse getDashboard(String coachId) {
        User user = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }

        return CoachDashboardResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                // Fields default to 0 as defined in DTO Builder
                .build();
    }
}
