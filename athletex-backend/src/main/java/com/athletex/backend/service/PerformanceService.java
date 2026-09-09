package com.athletex.backend.service;

import com.athletex.backend.dto.FitnessProfileResponse;
import com.athletex.backend.model.Performance;
import com.athletex.backend.model.PerformanceHistory;
import com.athletex.backend.model.Training;
import com.athletex.backend.model.TrainingStatus;
import com.athletex.backend.repository.PerformanceHistoryRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;
    private final ActivityService activityService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TrainingRepository trainingRepository;

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

    /*
     * BANISTER FITNESS-FRESHNESS (FORM) & 5-PILLAR RADAR PROFILE
     */
    public FitnessProfileResponse getFitnessProfile(String userId) {
        Performance perf = getPerformance(userId);

        double speed = perf.getSpeed() != null ? perf.getSpeed() : 0.0;
        double strength = perf.getStrength() != null ? perf.getStrength() : 0.0;
        double endurance = perf.getEndurance() != null ? perf.getEndurance() : 0.0;
        double agility = perf.getAgility() != null ? perf.getAgility() : 0.0;

        // Fetch trainings
        List<Training> trainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(userId);
        long completedTrainings = trainings.stream()
                .filter(t -> t.getStatus() == TrainingStatus.COMPLETED)
                .count();
        long totalTrainings = trainings.size();

        double consistency;
        if (totalTrainings > 0) {
            consistency = Math.min(100.0, Math.round(((double) completedTrainings / totalTrainings) * 100.0 * 10.0) / 10.0);
        } else {
            consistency = (speed + strength + endurance + agility) > 0 ? 82.0 : 50.0;
        }

        double overallFitness = Math.round(((speed * 0.25) + (endurance * 0.25) + (strength * 0.2) + (agility * 0.15) + (consistency * 0.15)) * 10.0) / 10.0;

        // Banister calculation:
        // Calculate recent 7-day load and 42-day load
        LocalDate today = LocalDate.now();
        double recent7DayLoad = 0;
        double chronic42DayLoad = 0;
        int chronicSessionCount = 0;

        for (Training t : trainings) {
            if (t.getStatus() == TrainingStatus.COMPLETED && t.getDate() != null) {
                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today);
                int duration = t.getActualDurationMinutes() != null && t.getActualDurationMinutes() > 0 ? t.getActualDurationMinutes() : 60;
                int rpe = t.getRpe() != null && t.getRpe() > 0 ? t.getRpe() : 7;
                double sessionLoad = (duration * rpe) / 10.0; // Scaled AU

                if (daysAgo >= 0 && daysAgo <= 7) {
                    recent7DayLoad += sessionLoad;
                }
                if (daysAgo >= 0 && daysAgo <= 42) {
                    chronic42DayLoad += sessionLoad;
                    chronicSessionCount++;
                }
            }
        }

        // Normalize Fitness (Conditioning, CTL) and Fatigue (ATL)
        double fitnessScore;
        double fatigueScore;

        if (chronicSessionCount > 0) {
            fitnessScore = Math.min(98.0, Math.max(25.0, Math.round((chronic42DayLoad / 42.0) * 1.5 + (overallFitness * 0.4))));
            fatigueScore = Math.min(95.0, Math.max(15.0, Math.round((recent7DayLoad / 7.0) * 1.4)));
        } else {
            fitnessScore = overallFitness > 0 ? Math.round(overallFitness * 0.88) : 65.0;
            fatigueScore = Math.max(20.0, Math.round(fitnessScore * 0.72));
        }

        double formScore = Math.round((fitnessScore - fatigueScore) * 10.0) / 10.0;

        String formStatus;
        String formBadge;
        String formDescription;

        if (formScore >= 12.0) {
            formStatus = "PEAK_MATCH_FITNESS";
            formBadge = "🚀 Peak Match Fitness";
            formDescription = "Conditioning is at peak with minimal acute fatigue. The athlete is primed for high-stakes competition.";
        } else if (formScore >= -4.0) {
            formStatus = "OPTIMAL_TRAINING";
            formBadge = "🟢 Optimal Conditioning";
            formDescription = "Training load is well-balanced. Actively building physiological stamina and capacity.";
        } else if (formScore >= -16.0) {
            formStatus = "MODERATE_FATIGUE";
            formBadge = "🟡 Elevated Strain";
            formDescription = "Fatigue is accumulating from intensive workout blocks. Active recovery and mobility recommended.";
        } else {
            formStatus = "HEAVY_FATIGUE";
            formBadge = "🔴 Deload Required";
            formDescription = "Acute strain significantly outpaces recovery. High overreaching risk; schedule a rest day.";
        }

        String fitnessTier;
        if (overallFitness >= 85.0) {
            fitnessTier = "ELITE_DIVISION";
        } else if (overallFitness >= 72.0) {
            fitnessTier = "SEMI_PRO";
        } else if (overallFitness >= 58.0) {
            fitnessTier = "VARSITY";
        } else {
            fitnessTier = "DEVELOPMENT";
        }

        List<FitnessProfileResponse.RadarPillarItem> radarData = List.of(
                FitnessProfileResponse.RadarPillarItem.builder().pillar("Speed").value(speed).benchmark(75.0).build(),
                FitnessProfileResponse.RadarPillarItem.builder().pillar("Endurance").value(endurance).benchmark(70.0).build(),
                FitnessProfileResponse.RadarPillarItem.builder().pillar("Strength").value(strength).benchmark(68.0).build(),
                FitnessProfileResponse.RadarPillarItem.builder().pillar("Agility").value(agility).benchmark(72.0).build(),
                FitnessProfileResponse.RadarPillarItem.builder().pillar("Consistency").value(consistency).benchmark(80.0).build()
        );

        List<FitnessProfileResponse.FitnessTrendItem> trendData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 13; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            double dailyNoise = Math.sin(i * 0.8) * 4.0;
            double tFitness = Math.round(Math.max(20.0, Math.min(100.0, fitnessScore - (i * 0.5) + (dailyNoise * 0.3))));
            double tFatigue = Math.round(Math.max(10.0, Math.min(100.0, fatigueScore + dailyNoise)));
            double tForm = Math.round((tFitness - tFatigue) * 10.0) / 10.0;

            trendData.add(FitnessProfileResponse.FitnessTrendItem.builder()
                    .date(date.format(formatter))
                    .fitness(tFitness)
                    .fatigue(tFatigue)
                    .form(tForm)
                    .build());
        }

        return FitnessProfileResponse.builder()
                .userId(userId)
                .fitnessScore(fitnessScore)
                .fatigueScore(fatigueScore)
                .formScore(formScore)
                .formStatus(formStatus)
                .formBadge(formBadge)
                .formDescription(formDescription)
                .fitnessTier(fitnessTier)
                .speed(speed)
                .strength(strength)
                .endurance(endurance)
                .agility(agility)
                .consistency(consistency)
                .overallFitnessScore(overallFitness)
                .radarData(radarData)
                .trendData(trendData)
                .build();
    }
}