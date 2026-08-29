package com.athletex.backend.service;

import com.athletex.backend.model.Performance;
import com.athletex.backend.repository.PerformanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import com.athletex.backend.model.PerformanceHistory;
import com.athletex.backend.repository.PerformanceHistoryRepository;
import com.athletex.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;
    private final ActivityService activityService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /*
     * GET PERFORMANCE
     */
    public Performance getPerformance(String userId) {

        return performanceRepository.findByUserId(userId)
                .orElseGet(() -> {

                    Performance performance = Performance.builder()
                            .userId(userId)
                            .speed(0.0)
                            .strength(0.0)
                            .endurance(0.0)
                            .agility(0.0)
                            .overallScore(0.0)
                            .lastUpdated(LocalDateTime.now())
                            .build();

                    return performanceRepository.save(performance);
                });
    }


    /*
     * UPDATE PERFORMANCE
     */
    public Performance updatePerformance(
            String userId,
            Double speed,
            Double strength,
            Double endurance,
            Double agility
    ) {

        Performance performance = performanceRepository
                .findByUserId(userId)
                .orElseGet(() -> Performance.builder()
                        .userId(userId)
                        .build());


        // Validate values
        speed = validateScore(speed);
        strength = validateScore(strength);
        endurance = validateScore(endurance);
        agility = validateScore(agility);


        // Update individual metrics
        performance.setSpeed(speed);
        performance.setStrength(strength);
        performance.setEndurance(endurance);
        performance.setAgility(agility);


        // Calculate overall score
        double overallScore =
                (speed + strength + endurance + agility) / 4.0;

        performance.setOverallScore(
                Math.round(overallScore * 100.0) / 100.0
        );


        // Tag as athlete self-reported
        performance.setLastEvaluatedBy("ATHLETE");
        performance.setIsCoachVerified(false);

        // Update timestamp
        performance.setLastUpdated(LocalDateTime.now());

        // Save to MongoDB
        Performance savedPerformance = performanceRepository.save(performance);

        // Save history snapshot
        PerformanceHistory history = PerformanceHistory.builder()
                .userId(userId)
                .speed(speed)
                .strength(strength)
                .endurance(endurance)
                .agility(agility)
                .overallScore(overallScore)
                .recordedAt(LocalDateTime.now())
                .build();
        performanceHistoryRepository.save(history);

        // Record activity
        activityService.createActivity(
                userId,
                "performance_update",
                "Self-Reported Performance Updated",
                "You updated your self-reported ratings.",
                "🏃"
        );

        return savedPerformance;
    }

    /*
     * VERIFY / ENDORSE PERFORMANCE BY COACH
     */
    public Performance verifyPerformanceByCoach(String athleteId, String coachId) {
        var coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        Performance performance = getPerformance(athleteId);
        performance.setIsCoachVerified(true);
        performance.setVerifiedByCoachId(coach.getId());
        performance.setVerifiedByCoachName(coach.getFullName());
        performance.setLastEvaluatedBy("COACH");
        performance.setLastUpdated(LocalDateTime.now());

        Performance saved = performanceRepository.save(performance);

        activityService.createActivity(
                athleteId,
                "performance_verified",
                "Ratings Officially Verified",
                "Coach " + coach.getFullName() + " endorsed your performance metrics.",
                "✔"
        );

        try {
            notificationService.sendNotification(
                    athleteId,
                    "Ratings Officially Verified! ✔",
                    "Coach " + coach.getFullName() + " officially verified your performance ratings.",
                    "VERIFICATION",
                    "/performance"
            );
        } catch (Exception e) {
            // Non-blocking
        }

        return saved;
    }


    /*
     * SCORE VALIDATION
     */
    private Double validateScore(Double score) {

        if (score == null) {
            return 0.0;
        }

        if (score < 0) {
            return 0.0;
        }

        if (score > 100) {
            return 100.0;
        }

        return score;
    }

    /*
     * GET PERFORMANCE HISTORY
     */
    public java.util.List<PerformanceHistory> getPerformanceHistory(String userId) {
        return performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(userId);
    }
}