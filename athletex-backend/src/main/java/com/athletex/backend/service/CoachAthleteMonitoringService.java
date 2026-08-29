package com.athletex.backend.service;

import com.athletex.backend.dto.CoachAthleteResponse;
import com.athletex.backend.dto.CoachEvaluationResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CoachAthleteMonitoringService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;
    private final AchievementRepository achievementRepository;
    private final CoachEvaluationRepository evaluationRepository;

    public CoachAthleteResponse getAthleteMonitoringDetails(String coachId, String athleteId) {
        // 1. Verify Coach exists and has COACH role
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        // 2. Verify Athlete exists and has ATHLETE role
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        if (athlete.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Target user is not an athlete");
        }

        // 3. Verify Active assignment exists
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                coachId, athleteId, AssignmentStatus.ACTIVE
        );
        if (!isAssigned) {
            throw new SecurityException("Access Denied: Athlete is not assigned to this coach");
        }

        // 4. Fetch Performance
        Optional<Performance> performanceOpt = performanceRepository.findByUserId(athleteId);
        Double overallScore = 0.0;
        Double speed = 0.0;
        Double strength = 0.0;
        Double endurance = 0.0;
        Double agility = 0.0;

        if (performanceOpt.isPresent()) {
            Performance p = performanceOpt.get();
            overallScore = p.getOverallScore() != null ? p.getOverallScore() : 0.0;
            speed = p.getSpeed() != null ? p.getSpeed() : 0.0;
            strength = p.getStrength() != null ? p.getStrength() : 0.0;
            endurance = p.getEndurance() != null ? p.getEndurance() : 0.0;
            agility = p.getAgility() != null ? p.getAgility() : 0.0;
        }

        // 5. Fetch Performance History
        List<PerformanceHistory> history = performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(athleteId);
        if (history == null) {
            history = Collections.emptyList();
        }

        // 6. Fetch Achievements
        List<Achievement> achievements = achievementRepository.findByUserIdOrderByDateDesc(athleteId);
        if (achievements == null) {
            achievements = Collections.emptyList();
        }

        // 7. Fetch Coach Evaluation
        CoachEvaluationResponse evaluationResponse = evaluationRepository
                .findFirstByCoachIdAndAthleteIdOrderByCreatedAtDesc(coachId, athleteId)
                .map(e -> CoachEvaluationResponse.builder()
                        .id(e.getId())
                        .coachId(e.getCoachId())
                        .coachName(coach.getFullName())
                        .athleteId(e.getAthleteId())
                        .readinessStatus(e.getReadinessStatus())
                        .coachFeedback(e.getCoachFeedback())
                        .targetSpeed(e.getTargetSpeed())
                        .targetStrength(e.getTargetStrength())
                        .targetEndurance(e.getTargetEndurance())
                        .targetAgility(e.getTargetAgility())
                        .createdAt(e.getCreatedAt())
                        .updatedAt(e.getUpdatedAt())
                        .build())
                .orElse(null);

        // 8. Build and return response
        return CoachAthleteResponse.builder()
                .id(athlete.getId())
                .fullName(athlete.getFullName() != null ? athlete.getFullName() : "")
                .email(athlete.getEmail() != null ? athlete.getEmail() : "")
                .phone(athlete.getPhone() != null ? athlete.getPhone() : "")
                .profileImage(athlete.getProfileImage() != null ? athlete.getProfileImage() : "")
                .sport(athlete.getSport() != null ? athlete.getSport() : "")
                .position(athlete.getPosition() != null ? athlete.getPosition() : "")
                .age(athlete.getAge())
                .gender(athlete.getGender() != null ? athlete.getGender() : "")
                .height(athlete.getHeight())
                .weight(athlete.getWeight())
                .city(athlete.getCity() != null ? athlete.getCity() : "")
                .state(athlete.getState() != null ? athlete.getState() : "")
                .country(athlete.getCountry() != null ? athlete.getCountry() : "")
                .bio(athlete.getBio() != null ? athlete.getBio() : "")
                .overallScore(overallScore)
                .speed(speed)
                .strength(strength)
                .endurance(endurance)
                .agility(agility)
                .achievements(achievements)
                .performanceHistory(history)
                .coachEvaluation(evaluationResponse)
                .build();
    }
}
