package com.athletex.backend.service;

import com.athletex.backend.dto.CoachDashboardResponse;
import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.model.Performance;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.TrainingStatus;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CoachDashboardService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final TrainingRepository trainingRepository;
    private final PerformanceRepository performanceRepository;

    public CoachDashboardResponse getDashboard(String coachId) {
        User user = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }

        List<CoachAthleteAssignment> assignments = assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        long totalAthletes = assignments.size();
        long upcomingTraining = trainingRepository.countByCoachIdAndStatus(coachId, TrainingStatus.SCHEDULED);

        double totalPerf = 0.0;
        int perfCount = 0;
        for (CoachAthleteAssignment a : assignments) {
            if (a.getAthleteId() != null) {
                Optional<Performance> pOpt = performanceRepository.findByUserId(a.getAthleteId());
                if (pOpt.isPresent() && pOpt.get().getOverallScore() != null) {
                    totalPerf += pOpt.get().getOverallScore();
                    perfCount++;
                }
            }
        }
        double avgPerformance = perfCount > 0 ? Math.round((totalPerf / perfCount) * 10.0) / 10.0 : 0.0;

        return CoachDashboardResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .totalAthletes((int) totalAthletes)
                .upcomingTraining((int) upcomingTraining)
                .averagePerformance(avgPerformance)
                .build();
    }
}

