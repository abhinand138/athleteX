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

        // Banister & Tim Gabbett ACWR calculation:
        // Calculate recent 7-day load and 28-day / 42-day loads
        LocalDate today = LocalDate.now();
        double recent7DayLoad = 0;
        double chronic42DayLoad = 0;
        double chronic28DayLoad = 0;
        int chronicSessionCount = 0;

        for (Training t : trainings) {
            if (t.getStatus() == TrainingStatus.COMPLETED && t.getDate() != null) {
                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today);
                int duration = t.getActualDurationMinutes() != null && t.getActualDurationMinutes() > 0 ? t.getActualDurationMinutes() : 60;
                int rpe = t.getRpe() != null && t.getRpe() > 0 ? t.getRpe() : 7;
                double sessionRawAU = (duration * rpe);
                double sessionLoadScaled = sessionRawAU / 10.0; // Scaled AU

                if (daysAgo >= 0 && daysAgo <= 7) {
                    recent7DayLoad += sessionLoadScaled;
                }
                if (daysAgo >= 0 && daysAgo <= 28) {
                    chronic28DayLoad += sessionRawAU;
                }
                if (daysAgo >= 0 && daysAgo <= 42) {
                    chronic42DayLoad += sessionLoadScaled;
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

        // ACWR (Acute:Chronic Workload Ratio) Calculations
        double rawAcute7Day = recent7DayLoad * 10.0; // unscaled raw AU
        double chronicWeeklyAvg = chronic28DayLoad > 0 ? Math.round((chronic28DayLoad / 4.0) * 10.0) / 10.0 : 0.0;
        double acwr;
        if (chronicWeeklyAvg > 0) {
            acwr = Math.round((rawAcute7Day / chronicWeeklyAvg) * 100.0) / 100.0;
        } else if (rawAcute7Day > 0) {
            acwr = 1.45;
        } else {
            acwr = 1.0;
        }

        String acwrStatus;
        String acwrBadge;
        String acwrRecommendation;
        double injuryRiskIndex;

        if (acwr >= 1.5) {
            acwrStatus = "DANGER_ZONE";
            acwrBadge = "🔴 High Injury Danger (> 1.5)";
            acwrRecommendation = "Critical Acute Spike! Acute training impulse is " + acwr + "x higher than your 28-day chronic baseline. Soft-tissue injury risk is elevated 2.5x to 4x. Immediately schedule active recovery, foam rolling, and reduce sprint volume by 25-30%.";
            injuryRiskIndex = Math.min(95.0, 65.0 + (acwr - 1.5) * 40.0);
        } else if (acwr >= 1.3) {
            acwrStatus = "MODERATE_SPIKE";
            acwrBadge = "🟡 Elevated Strain (1.3 - 1.5)";
            acwrRecommendation = "Overreaching Zone: Fatigue is accumulating faster than tissue remodelling. Ensure 8+ hours of sleep, hydrate well, and monitor hamstring/calf tightness before high-velocity sessions.";
            injuryRiskIndex = 45.0 + ((acwr - 1.3) / 0.2) * 20.0;
        } else if (acwr >= 0.8) {
            acwrStatus = "SWEET_SPOT";
            acwrBadge = "🟢 Optimal Sweet Spot (0.8 - 1.3)";
            acwrRecommendation = "Gabbett Sweet Spot: Workload is building athletic capacity and endurance with minimized injury likelihood. Perfect physiological adaptation window.";
            injuryRiskIndex = 15.0 + ((acwr - 0.8) / 0.5) * 15.0;
        } else {
            acwrStatus = "UNDERTRAINING";
            acwrBadge = "🔵 Under-Stimulated (< 0.8)";
            acwrRecommendation = "Fitness Decay Alert: Acute stimulus has dropped significantly below chronic capacity. Progressive re-introduction of volume is required to prevent an injury spike when resuming full competition.";
            injuryRiskIndex = 35.0;
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
                .acwr(acwr)
                .acwrStatus(acwrStatus)
                .acwrBadge(acwrBadge)
                .acwrRecommendation(acwrRecommendation)
                .acute7DayLoad((double) Math.round(rawAcute7Day))
                .chronic28DayLoad((double) Math.round(chronic28DayLoad))
                .chronicWeeklyAverageLoad(chronicWeeklyAvg)
                .injuryRiskIndex(Math.round(injuryRiskIndex * 10.0) / 10.0)
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

    /*
     * =========================================================================
     * WORKOUT-DRIVEN PERFORMANCE ENGINE (AUTOMATED & SCIENTIFIC)
     * =========================================================================
     */

    /**
     * Automatically recalculates athlete's 4-pillar scores and overall score
     * purely from completed training sessions, RPE intensity, and volume.
     */
    public Performance recalculatePerformanceFromWorkouts(String userId) {
        Performance performance = performanceRepository.findByUserId(userId)
                .orElseGet(() -> Performance.builder().userId(userId).build());

        List<Training> allTrainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(userId);
        LocalDate today = LocalDate.now();

        double speedLoad = 0;
        double strengthLoad = 0;
        double enduranceLoad = 0;
        double agilityLoad = 0;
        int completedWindowSessions = 0;

        for (Training t : allTrainings) {
            if (t.getStatus() == TrainingStatus.COMPLETED && t.getDate() != null) {
                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today);
                if (daysAgo >= 0 && daysAgo <= 28) {
                    completedWindowSessions++;
                    int duration = t.getActualDurationMinutes() != null && t.getActualDurationMinutes() > 0 ? t.getActualDurationMinutes() : 60;
                    int rpe = t.getRpe() != null && t.getRpe() > 0 ? t.getRpe() : 7;
                    double rawAU = (duration * rpe);

                    // Recency weight: sessions in last 7 days carry more neurological punch
                    double recencyWeight = Math.max(0.25, 1.0 - (daysAgo * 0.025));
                    double sessionAU = rawAU * recencyWeight;

                    String cat = (t.getCategory() != null ? t.getCategory().toUpperCase() : "");
                    String title = (t.getTitle() != null ? t.getTitle().toUpperCase() : "");

                    boolean matched = false;
                    if (cat.contains("SPEED") || cat.contains("SPRINT") || title.contains("SPEED") || title.contains("SPRINT") || title.contains("ACCELERATION")) {
                        speedLoad += sessionAU;
                        matched = true;
                    }
                    if (cat.contains("STRENGTH") || cat.contains("WEIGHT") || cat.contains("POWER") || title.contains("STRENGTH") || title.contains("LIFT") || title.contains("SQUAT") || title.contains("BENCH")) {
                        strengthLoad += sessionAU;
                        matched = true;
                    }
                    if (cat.contains("ENDURANCE") || cat.contains("CARDIO") || cat.contains("RUN") || cat.contains("HIIT") || title.contains("ENDURANCE") || title.contains("RUN") || title.contains("TEMPO")) {
                        enduranceLoad += sessionAU;
                        matched = true;
                    }
                    if (cat.contains("AGILITY") || cat.contains("PLYO") || cat.contains("SHUTTLE") || cat.contains("CONE") || title.contains("AGILITY") || title.contains("LADDER") || title.contains("CONE")) {
                        agilityLoad += sessionAU;
                        matched = true;
                    }
                    if (!matched) {
                        // Distribute hybrid/generic sessions evenly
                        speedLoad += sessionAU * 0.25;
                        strengthLoad += sessionAU * 0.25;
                        enduranceLoad += sessionAU * 0.25;
                        agilityLoad += sessionAU * 0.25;
                    }
                }
            }
        }

        // Calculate pillar scores using physiological logarithmic scaling
        double baseFloor = 50.0;
        double maxGain = 46.0;

        double calcSpeed = completedWindowSessions > 0
                ? Math.round((baseFloor + maxGain * (1.0 - Math.exp(-speedLoad / 900.0))) * 10.0) / 10.0
                : (performance.getSpeed() != null && performance.getSpeed() > 0 ? performance.getSpeed() : 60.0);

        double calcStrength = completedWindowSessions > 0
                ? Math.round((baseFloor + maxGain * (1.0 - Math.exp(-strengthLoad / 900.0))) * 10.0) / 10.0
                : (performance.getStrength() != null && performance.getStrength() > 0 ? performance.getStrength() : 60.0);

        double calcEndurance = completedWindowSessions > 0
                ? Math.round((baseFloor + maxGain * (1.0 - Math.exp(-enduranceLoad / 900.0))) * 10.0) / 10.0
                : (performance.getEndurance() != null && performance.getEndurance() > 0 ? performance.getEndurance() : 60.0);

        double calcAgility = completedWindowSessions > 0
                ? Math.round((baseFloor + maxGain * (1.0 - Math.exp(-agilityLoad / 900.0))) * 10.0) / 10.0
                : (performance.getAgility() != null && performance.getAgility() > 0 ? performance.getAgility() : 60.0);

        // Clamp 0 - 100
        calcSpeed = Math.min(100.0, Math.max(10.0, calcSpeed));
        calcStrength = Math.min(100.0, Math.max(10.0, calcStrength));
        calcEndurance = Math.min(100.0, Math.max(10.0, calcEndurance));
        calcAgility = Math.min(100.0, Math.max(10.0, calcAgility));

        // Consistency from 30-day compliance
        long total30Day = allTrainings.stream()
                .filter(t -> t.getDate() != null && java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today) <= 30 && java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today) >= 0)
                .count();
        long completed30Day = allTrainings.stream()
                .filter(t -> t.getStatus() == TrainingStatus.COMPLETED && t.getDate() != null && java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today) <= 30 && java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today) >= 0)
                .count();

        double consistency = total30Day > 0
                ? Math.min(100.0, Math.round(((double) completed30Day / total30Day) * 100.0 * 10.0) / 10.0)
                : 80.0;

        double overall = Math.round(((calcSpeed * 0.25) + (calcEndurance * 0.25) + (calcStrength * 0.20) + (calcAgility * 0.15) + (consistency * 0.15)) * 10.0) / 10.0;

        Double previousOverall = performance.getOverallScore();

        performance.setSpeed(calcSpeed);
        performance.setStrength(calcStrength);
        performance.setEndurance(calcEndurance);
        performance.setAgility(calcAgility);
        performance.setOverallScore(overall);
        performance.setLastEvaluatedBy("WORKOUT_ENGINE");
        performance.setLastUpdated(LocalDateTime.now());

        Performance saved = performanceRepository.save(performance);

        // Record history snapshot if change is notable or first run
        if (previousOverall == null || Math.abs(overall - previousOverall) >= 0.5) {
            PerformanceHistory history = PerformanceHistory.builder()
                    .userId(userId)
                    .speed(calcSpeed)
                    .strength(calcStrength)
                    .endurance(calcEndurance)
                    .agility(calcAgility)
                    .overallScore(overall)
                    .recordedAt(LocalDateTime.now())
                    .build();
            performanceHistoryRepository.save(history);

            activityService.createActivity(
                    userId,
                    "workout_recalibration",
                    "Conditioning Index Recalibrated",
                    "Scores automatically updated to " + overall + "% based on recent training workload.",
                    "⚡"
            );
        }

        return saved;
    }

    /**
     * Generates a comprehensive workload attribution report showing session counts,
     * total impulse (AU), detraining states, and predicted gains from the next scheduled workout.
     */
    public com.athletex.backend.dto.WorkloadAttributionResponse getWorkloadAttribution(String userId) {
        List<Training> allTrainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(userId);
        LocalDate today = LocalDate.now();

        int completedCount = 0;
        double totalLoadAU = 0;

        int speedCount = 0; double speedAU = 0; Integer speedLastDays = null;
        int strengthCount = 0; double strengthAU = 0; Integer strengthLastDays = null;
        int enduranceCount = 0; double enduranceAU = 0; Integer enduranceLastDays = null;
        int agilityCount = 0; double agilityAU = 0; Integer agilityLastDays = null;

        for (Training t : allTrainings) {
            if (t.getStatus() == TrainingStatus.COMPLETED && t.getDate() != null) {
                completedCount++;
                int duration = t.getActualDurationMinutes() != null && t.getActualDurationMinutes() > 0 ? t.getActualDurationMinutes() : 60;
                int rpe = t.getRpe() != null && t.getRpe() > 0 ? t.getRpe() : 7;
                double load = (duration * rpe);
                totalLoadAU += load;

                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(t.getDate(), today);
                int days = (int) Math.max(0, daysAgo);

                String cat = (t.getCategory() != null ? t.getCategory().toUpperCase() : "");
                String title = (t.getTitle() != null ? t.getTitle().toUpperCase() : "");

                if (cat.contains("SPEED") || cat.contains("SPRINT") || title.contains("SPEED") || title.contains("SPRINT")) {
                    speedCount++; speedAU += load;
                    if (speedLastDays == null || days < speedLastDays) speedLastDays = days;
                } else if (cat.contains("STRENGTH") || cat.contains("WEIGHT") || cat.contains("POWER") || title.contains("STRENGTH") || title.contains("LIFT")) {
                    strengthCount++; strengthAU += load;
                    if (strengthLastDays == null || days < strengthLastDays) strengthLastDays = days;
                } else if (cat.contains("ENDURANCE") || cat.contains("CARDIO") || cat.contains("RUN") || title.contains("RUN") || title.contains("CARDIO")) {
                    enduranceCount++; enduranceAU += load;
                    if (enduranceLastDays == null || days < enduranceLastDays) enduranceLastDays = days;
                } else if (cat.contains("AGILITY") || cat.contains("PLYO") || cat.contains("SHUTTLE") || title.contains("AGILITY") || title.contains("LADDER")) {
                    agilityCount++; agilityAU += load;
                    if (agilityLastDays == null || days < agilityLastDays) agilityLastDays = days;
                } else {
                    speedCount++; speedAU += load * 0.25;
                    strengthCount++; strengthAU += load * 0.25;
                    enduranceCount++; enduranceAU += load * 0.25;
                    agilityCount++; agilityAU += load * 0.25;
                    if (speedLastDays == null || days < speedLastDays) speedLastDays = days;
                    if (strengthLastDays == null || days < strengthLastDays) strengthLastDays = days;
                    if (enduranceLastDays == null || days < enduranceLastDays) enduranceLastDays = days;
                    if (agilityLastDays == null || days < agilityLastDays) agilityLastDays = days;
                }
            }
        }

        Performance performance = getPerformance(userId);

        java.util.Map<String, com.athletex.backend.dto.WorkloadAttributionResponse.CategoryMetric> metrics = new java.util.HashMap<>();
        metrics.put("SPEED", com.athletex.backend.dto.WorkloadAttributionResponse.CategoryMetric.builder()
                .category("Speed")
                .sessionsCount(speedCount)
                .totalLoadAU(Math.round(speedAU))
                .lastTrainedDaysAgo(speedLastDays)
                .score(performance.getSpeed() != null ? performance.getSpeed() : 60.0)
                .status(determineStatus(speedLastDays, speedCount))
                .build());

        metrics.put("STRENGTH", com.athletex.backend.dto.WorkloadAttributionResponse.CategoryMetric.builder()
                .category("Strength")
                .sessionsCount(strengthCount)
                .totalLoadAU(Math.round(strengthAU))
                .lastTrainedDaysAgo(strengthLastDays)
                .score(performance.getStrength() != null ? performance.getStrength() : 60.0)
                .status(determineStatus(strengthLastDays, strengthCount))
                .build());

        metrics.put("ENDURANCE", com.athletex.backend.dto.WorkloadAttributionResponse.CategoryMetric.builder()
                .category("Endurance")
                .sessionsCount(enduranceCount)
                .totalLoadAU(Math.round(enduranceAU))
                .lastTrainedDaysAgo(enduranceLastDays)
                .score(performance.getEndurance() != null ? performance.getEndurance() : 60.0)
                .status(determineStatus(enduranceLastDays, enduranceCount))
                .build());

        metrics.put("AGILITY", com.athletex.backend.dto.WorkloadAttributionResponse.CategoryMetric.builder()
                .category("Agility")
                .sessionsCount(agilityCount)
                .totalLoadAU(Math.round(agilityAU))
                .lastTrainedDaysAgo(agilityLastDays)
                .score(performance.getAgility() != null ? performance.getAgility() : 60.0)
                .status(determineStatus(agilityLastDays, agilityCount))
                .build());

        // Find next scheduled workout to predict boost
        List<Training> upcoming = trainingRepository.findByAthleteIdAndStatusOrderByDateAscTimeAsc(userId, TrainingStatus.SCHEDULED);
        String nextImpact = "Complete your next scheduled workout to increase your training impulse and condition rating.";
        String nextTitle = null;
        Double gain = 2.5;

        if (!upcoming.isEmpty()) {
            Training next = upcoming.get(0);
            nextTitle = next.getTitle() != null ? next.getTitle() : "Upcoming Workout";
            String cat = next.getCategory() != null ? next.getCategory() : "Training";
            nextImpact = "Completing '" + nextTitle + "' (" + cat + ") will increase your training volume and boost your conditioning index!";
            gain = 3.0;
        }

        return com.athletex.backend.dto.WorkloadAttributionResponse.builder()
                .userId(userId)
                .totalCompletedWorkouts(completedCount)
                .totalTrainingLoadAU(Math.round(totalLoadAU))
                .windowDays(28)
                .consistencyPercentage(85.0)
                .categoryMetrics(metrics)
                .nextWorkoutImpact(nextImpact)
                .nextWorkoutTitle(nextTitle)
                .potentialScoreGain(gain)
                .build();
    }

    private String determineStatus(Integer lastDaysAgo, int sessions) {
        if (lastDaysAgo == null || sessions == 0) return "Untrained";
        if (lastDaysAgo <= 3 && sessions >= 3) return "Peaking";
        if (lastDaysAgo <= 7) return "Building";
        if (lastDaysAgo <= 14) return "Maintaining";
        return "Detraining";
    }
}