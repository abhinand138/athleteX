package com.athletex.backend.service;

import com.athletex.backend.dto.drill.CoachReviewDrillRequest;
import com.athletex.backend.dto.drill.CombineSummaryResponse;
import com.athletex.backend.dto.drill.LogDrillRequest;
import com.athletex.backend.dto.drill.PendingDrillReviewResponse;
import com.athletex.backend.dto.drill.PersonalRecordDto;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.PerformanceDrillRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceDrillService {

    private final PerformanceDrillRepository drillRepository;
    private final PerformanceRepository performanceRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final PerformanceService performanceService;

    /**
     * Determines whether lower value indicates a better result for the given drill.
     */
    public boolean isLowerBetter(String drillCode, Boolean explicitLowerIsBetter) {
        if (explicitLowerIsBetter != null) {
            return explicitLowerIsBetter;
        }
        if (drillCode == null) return false;
        String code = drillCode.toUpperCase();
        if (code.contains("BOWLING_SPEED") || code.contains("YO_YO") || code.contains("YOYO")) {
            return false;
        }
        return code.contains("DASH") || code.contains("SPRINT") || code.contains("RUN") ||
                code.contains("SHUTTLE") || code.contains("AGILITY") || code.contains("TIME") ||
                code.contains("TRIAL") || code.contains("PITCH") || code.contains("505") ||
                code.contains("CONE") || code.contains("T_TEST");
    }

    /**
     * Calculates benchmark percentile (0-100) and athletic tier for a drill result.
     */
    public Map<String, Object> evaluateBenchmark(String drillCode, Double value, boolean lowerIsBetter) {
        if (value == null || value <= 0) {
            return Map.of("percentile", 50.0, "tier", "Development");
        }

        String code = drillCode != null ? drillCode.toUpperCase() : "";
        double percentile = 50.0;
        String tier = "Development";

        switch (code) {
            case "40_YARD_DASH":
                if (value <= 4.38) { percentile = 99.0; tier = "Elite Division"; }
                else if (value <= 4.52) { percentile = 94.0; tier = "Pro"; }
                else if (value <= 4.68) { percentile = 86.0; tier = "Varsity Star"; }
                else if (value <= 4.88) { percentile = 74.0; tier = "Varsity"; }
                else if (value <= 5.15) { percentile = 60.0; tier = "Development"; }
                else { percentile = 45.0; tier = "Club"; }
                break;

            case "100M_SPRINT":
                if (value <= 10.45) { percentile = 99.0; tier = "Elite Division"; }
                else if (value <= 10.95) { percentile = 93.0; tier = "Pro"; }
                else if (value <= 11.50) { percentile = 84.0; tier = "Varsity Star"; }
                else if (value <= 12.20) { percentile = 72.0; tier = "Varsity"; }
                else { percentile = 55.0; tier = "Development"; }
                break;

            case "VERTICAL_JUMP":
                if (value >= 39.0) { percentile = 99.0; tier = "Elite Division"; }
                else if (value >= 34.0) { percentile = 92.0; tier = "Pro"; }
                else if (value >= 29.0) { percentile = 82.0; tier = "Varsity Star"; }
                else if (value >= 24.0) { percentile = 70.0; tier = "Varsity"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "BENCH_PRESS_1RM":
                if (value >= 155.0) { percentile = 99.0; tier = "Elite Division"; }
                else if (value >= 125.0) { percentile = 91.0; tier = "Pro"; }
                else if (value >= 100.0) { percentile = 80.0; tier = "Varsity Star"; }
                else if (value >= 75.0) { percentile = 65.0; tier = "Varsity"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "SQUAT_1RM":
                if (value >= 210.0) { percentile = 99.0; tier = "Elite Division"; }
                else if (value >= 170.0) { percentile = 91.0; tier = "Pro"; }
                else if (value >= 135.0) { percentile = 80.0; tier = "Varsity Star"; }
                else if (value >= 100.0) { percentile = 65.0; tier = "Varsity"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "DEADLIFT_1RM":
                if (value >= 235.0) { percentile = 99.0; tier = "Elite Division"; }
                else if (value >= 195.0) { percentile = 91.0; tier = "Pro"; }
                else if (value >= 155.0) { percentile = 80.0; tier = "Varsity Star"; }
                else if (value >= 115.0) { percentile = 65.0; tier = "Varsity"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "PRO_AGILITY_5105":
                if (value <= 4.05) { percentile = 99.0; tier = "Elite Division"; }
                else if (value <= 4.25) { percentile = 93.0; tier = "Pro"; }
                else if (value <= 4.45) { percentile = 83.0; tier = "Varsity Star"; }
                else if (value <= 4.70) { percentile = 70.0; tier = "Varsity"; }
                else { percentile = 52.0; tier = "Development"; }
                break;

            case "L_DRILL_3CONE":
                if (value <= 6.85) { percentile = 99.0; tier = "Elite Division"; }
                else if (value <= 7.15) { percentile = 92.0; tier = "Pro"; }
                else if (value <= 7.45) { percentile = 82.0; tier = "Varsity"; }
                else { percentile = 60.0; tier = "Development"; }
                break;

            case "BEEP_TEST":
                if (value >= 13.5) { percentile = 98.0; tier = "Elite Division"; }
                else if (value >= 11.5) { percentile = 90.0; tier = "Pro"; }
                else if (value >= 9.5) { percentile = 78.0; tier = "Varsity"; }
                else { percentile = 60.0; tier = "Development"; }
                break;

            case "FIVE_K_RUN":
                if (value <= 16.5) { percentile = 99.0; tier = "Elite Division"; }
                else if (value <= 18.5) { percentile = 92.0; tier = "Pro"; }
                else if (value <= 21.0) { percentile = 82.0; tier = "Varsity Star"; }
                else if (value <= 25.0) { percentile = 68.0; tier = "Varsity"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "BCCI_2KM_TIME_TRIAL":
                double trialMinutes = value > 50 ? value / 60.0 : value;
                if (trialMinutes <= 7.45) { percentile = 99.0; tier = "Elite Pro (BCCI Standard)"; }
                else if (trialMinutes <= 8.15) { percentile = 93.0; tier = "National Bowler Standard"; }
                else if (trialMinutes <= 8.30) { percentile = 84.0; tier = "Ranji / First Class"; }
                else if (trialMinutes <= 9.00) { percentile = 70.0; tier = "State Academy"; }
                else { percentile = 50.0; tier = "Club Developing"; }
                break;

            case "YO_YO_IR1_CRICKET":
            case "YO_YO_TEST":
                if (value >= 20.0) { percentile = 99.0; tier = "International Elite"; }
                else if (value >= 18.5) { percentile = 92.0; tier = "National Team Cutoff"; }
                else if (value >= 17.1) { percentile = 82.0; tier = "State / Pro Standard"; }
                else if (value >= 16.1) { percentile = 70.0; tier = "Academy Qualified"; }
                else { percentile = 50.0; tier = "Below Benchmark"; }
                break;

            case "CRICKET_22YD_PITCH_SPRINT":
                if (value <= 2.85) { percentile = 99.0; tier = "Lightning Quick"; }
                else if (value <= 3.00) { percentile = 92.0; tier = "International Standard"; }
                else if (value <= 3.15) { percentile = 82.0; tier = "First Class / Pro"; }
                else if (value <= 3.35) { percentile = 70.0; tier = "Club Athlete"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "BOWLING_SPEED_KMH":
                if (value >= 145.0) { percentile = 99.0; tier = "Express Pace (145+ km/h)"; }
                else if (value >= 138.0) { percentile = 93.0; tier = "Fast (138-145 km/h)"; }
                else if (value >= 128.0) { percentile = 82.0; tier = "Fast-Medium (128-138 km/h)"; }
                else if (value >= 118.0) { percentile = 68.0; tier = "Medium-Pace (118-128 km/h)"; }
                else { percentile = 50.0; tier = "Developing Pace"; }
                break;

            case "FOOTBALL_30M_SPRINT":
                if (value <= 3.82) { percentile = 99.0; tier = "UCL / Premier Tier"; }
                else if (value <= 3.98) { percentile = 93.0; tier = "Pro Division 1"; }
                else if (value <= 4.15) { percentile = 82.0; tier = "Academy Tier 1"; }
                else if (value <= 4.35) { percentile = 70.0; tier = "Varsity / Club"; }
                else { percentile = 50.0; tier = "Development"; }
                break;

            case "FOOTBALL_505_AGILITY":
                if (value <= 2.15) { percentile = 99.0; tier = "Elite Pro"; }
                else if (value <= 2.28) { percentile = 92.0; tier = "Pro Academy"; }
                else if (value <= 2.42) { percentile = 80.0; tier = "Varsity Starter"; }
                else { percentile = 60.0; tier = "Development"; }
                break;

            case "ILLINOIS_AGILITY_TEST":
                if (value <= 15.2) { percentile = 99.0; tier = "World Class"; }
                else if (value <= 16.1) { percentile = 92.0; tier = "Elite Academy"; }
                else if (value <= 17.2) { percentile = 80.0; tier = "Competitor"; }
                else { percentile = 55.0; tier = "Development"; }
                break;

            default:
                percentile = 75.0;
                tier = "Competitor";
                break;
        }

        return Map.of("percentile", percentile, "tier", tier);
    }

    /**
     * Logs a new combine drill attempt, evaluates PR status, and notifies athlete and coach.
     */
    public PerformanceDrill logDrill(String userId, LogDrillRequest request) {
        boolean lowerIsBetter = isLowerBetter(request.getDrillCode(), request.getLowerIsBetter());

        // Find existing attempts for this drill
        List<PerformanceDrill> existingAttempts = drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(
                userId, request.getDrillCode()
        );

        // Check if there was an existing PR
        Optional<PerformanceDrill> currentPrOpt = existingAttempts.stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsPersonalRecord()))
                .findFirst();

        boolean isNewPr = false;
        if (currentPrOpt.isEmpty()) {
            isNewPr = true;
        } else {
            Double currentBest = currentPrOpt.get().getValue();
            if (currentBest != null) {
                if (lowerIsBetter) {
                    isNewPr = request.getValue() < currentBest;
                } else {
                    isNewPr = request.getValue() > currentBest;
                }
            } else {
                isNewPr = true;
            }
        }

        // Benchmark evaluation
        Map<String, Object> bench = evaluateBenchmark(request.getDrillCode(), request.getValue(), lowerIsBetter);
        Double percentile = (Double) bench.get("percentile");
        String tierBadge = (String) bench.get("tier");

        // If this is a new PR, remove PR flag from older record
        if (isNewPr && currentPrOpt.isPresent()) {
            PerformanceDrill oldPr = currentPrOpt.get();
            oldPr.setIsPersonalRecord(false);
            drillRepository.save(oldPr);
        }

        PerformanceDrill drill = PerformanceDrill.builder()
                .userId(userId)
                .drillCode(request.getDrillCode())
                .drillName(request.getDrillName())
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "SPEED")
                .value(request.getValue())
                .unit(request.getUnit())
                .lowerIsBetter(lowerIsBetter)
                .isPersonalRecord(isNewPr)
                .percentile(percentile)
                .tierBadge(tierBadge)
                .notes(request.getNotes())
                .proofUrl(request.getProofUrl())
                .recordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now())
                .isCoachVerified(false)
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        PerformanceDrill saved = drillRepository.save(drill);

        // Activity & Notifications
        if (isNewPr) {
            activityService.createActivity(
                    userId,
                    "personal_record",
                    "🎯 New Personal Record in " + request.getDrillName() + "!",
                    "You achieved an all-time PR of " + request.getValue() + " " + request.getUnit() + " (" + tierBadge + ")! Submitted for coach certification.",
                    "🏆"
            );

            try {
                notificationService.sendNotification(
                        userId,
                        "🏆 New Personal Record: " + request.getDrillName() + "!",
                        "Congratulations! You smashed your personal record with " + request.getValue() + " " + request.getUnit() + "! Submission queued for coach review.",
                        "ACHIEVEMENT",
                        "/performance"
                );
            } catch (Exception e) {
                log.warn("Notification error: {}", e.getMessage());
            }
        } else {
            activityService.createActivity(
                    userId,
                    "drill_attempt",
                    request.getDrillName() + " Logged",
                    "Attempt: " + request.getValue() + " " + request.getUnit() + ". Queued for coach certification.",
                    "⏱️"
            );
        }

        // Notify active coach if assigned
        notifyCoachOfSubmission(userId, request.getDrillName(), request.getValue(), request.getUnit(), request.getProofUrl(), isNewPr);

        return saved;
    }

    private void notifyCoachOfSubmission(String athleteId, String drillName, Double value, String unit, String proofUrl, boolean isNewPr) {
        try {
            Optional<CoachAthleteAssignment> assignment = assignmentRepository.findByAthleteIdAndStatus(athleteId, AssignmentStatus.ACTIVE);
            if (assignment.isPresent()) {
                String coachId = assignment.get().getCoachId();
                Optional<User> athleteOpt = userRepository.findById(athleteId);
                String athleteName = athleteOpt.map(User::getFullName).orElse("Your athlete");

                String title = isNewPr
                        ? "🔥 PR Awaiting Review: " + athleteName
                        : "⏱️ Drill Submitted: " + athleteName;

                String body = athleteName + " submitted a " + drillName + " attempt (" + value + " " + unit + ")"
                        + (proofUrl != null && !proofUrl.isBlank() ? " with video proof" : "") + " awaiting your certification.";

                notificationService.sendNotification(
                        coachId,
                        title,
                        body,
                        "PERFORMANCE",
                        "/coach/athletes/" + athleteId
                );
            }
        } catch (Exception e) {
            log.warn("Failed to notify coach of drill submission: {}", e.getMessage());
        }
    }

    /**
     * Retrieves summary of all combine tests, PR cards, and derived pillar scores.
     */
    public CombineSummaryResponse getCombineSummary(String userId) {
        List<PerformanceDrill> allDrills = drillRepository.findByUserIdOrderByRecordedAtDesc(userId);

        // Group by drillCode
        Map<String, List<PerformanceDrill>> byDrill = allDrills.stream()
                .collect(Collectors.groupingBy(PerformanceDrill::getDrillCode));

        List<PersonalRecordDto> prList = new ArrayList<>();

        for (Map.Entry<String, List<PerformanceDrill>> entry : byDrill.entrySet()) {
            List<PerformanceDrill> attempts = entry.getValue();
            if (attempts.isEmpty()) continue;

            // Sort so best is first
            boolean lowerIsBetter = attempts.get(0).getLowerIsBetter() != null && attempts.get(0).getLowerIsBetter();
            attempts.sort((a, b) -> {
                if (a.getValue() == null) return 1;
                if (b.getValue() == null) return -1;
                return lowerIsBetter ? Double.compare(a.getValue(), b.getValue()) : Double.compare(b.getValue(), a.getValue());
            });

            PerformanceDrill best = attempts.get(0);
            Double previousBest = attempts.size() > 1 ? attempts.get(1).getValue() : null;

            prList.add(PersonalRecordDto.builder()
                    .drillCode(best.getDrillCode())
                    .drillName(best.getDrillName())
                    .category(best.getCategory())
                    .bestValue(best.getValue())
                    .unit(best.getUnit())
                    .lowerIsBetter(best.getLowerIsBetter())
                    .achievedAt(best.getRecordedAt())
                    .previousBest(previousBest)
                    .attemptCount(attempts.size())
                    .percentile(best.getPercentile() != null ? best.getPercentile() : 75.0)
                    .tierBadge(best.getTierBadge() != null ? best.getTierBadge() : "Varsity")
                    .isCoachVerified(Boolean.TRUE.equals(best.getIsCoachVerified()))
                    .verificationStatus(best.getVerificationStatus() != null ? best.getVerificationStatus() : (Boolean.TRUE.equals(best.getIsCoachVerified()) ? VerificationStatus.APPROVED : VerificationStatus.PENDING))
                    .coachFeedback(best.getCoachFeedback())
                    .verifiedAt(best.getVerifiedAt())
                    .verifiedByCoachName(best.getVerifiedByCoachName())
                    .proofUrl(best.getProofUrl())
                    .latestRecordId(best.getId())
                    .build());
        }

        // Sort PRs by category (Speed, Strength, Endurance, Agility)
        prList.sort(Comparator.comparing(PersonalRecordDto::getCategory, Comparator.nullsLast(String::compareTo)));

        // Calculate derived category benchmark ratings from PRs
        Map<String, Double> categoryRatings = calculateCategoryRatings(prList);

        return CombineSummaryResponse.builder()
                .userId(userId)
                .totalAttempts(allDrills.size())
                .personalRecordsCount(prList.size())
                .personalRecords(prList)
                .recentAttempts(allDrills.stream().limit(10).collect(Collectors.toList()))
                .benchmarkScores(categoryRatings)
                .build();
    }

    /**
     * Calculates 0-100 pillar ratings derived from athlete's PR percentiles.
     */
    private Map<String, Double> calculateCategoryRatings(List<PersonalRecordDto> prs) {
        Map<String, List<Double>> categoryPercentiles = new HashMap<>();
        categoryPercentiles.put("SPEED", new ArrayList<>());
        categoryPercentiles.put("STRENGTH", new ArrayList<>());
        categoryPercentiles.put("ENDURANCE", new ArrayList<>());
        categoryPercentiles.put("AGILITY", new ArrayList<>());

        for (PersonalRecordDto pr : prs) {
            String cat = pr.getCategory() != null ? pr.getCategory().toUpperCase() : "SPEED";
            if (categoryPercentiles.containsKey(cat) && pr.getPercentile() != null) {
                categoryPercentiles.get(cat).add(pr.getPercentile());
            }
        }

        Map<String, Double> result = new HashMap<>();
        for (Map.Entry<String, List<Double>> entry : categoryPercentiles.entrySet()) {
            List<Double> list = entry.getValue();
            if (list.isEmpty()) {
                result.put(entry.getKey().toLowerCase(), 0.0);
            } else {
                double avg = list.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                result.put(entry.getKey().toLowerCase(), Math.round(avg * 10.0) / 10.0);
            }
        }

        double overall = (result.get("speed") + result.get("strength") + result.get("endurance") + result.get("agility")) / 4.0;
        result.put("overall", Math.round(overall * 10.0) / 10.0);

        return result;
    }

    /**
     * Automatically applies derived PR ratings into the main Performance entity.
     */
    public Performance syncRatingsFromPrs(String userId) {
        CombineSummaryResponse summary = getCombineSummary(userId);
        Map<String, Double> scores = summary.getBenchmarkScores();

        Double speed = scores.getOrDefault("speed", 0.0);
        Double strength = scores.getOrDefault("strength", 0.0);
        Double endurance = scores.getOrDefault("endurance", 0.0);
        Double agility = scores.getOrDefault("agility", 0.0);

        // Fetch current performance to keep existing scores if no PR logged for a category
        Performance current = performanceService.getPerformance(userId);
        if (speed <= 0 && current.getSpeed() != null && current.getSpeed() > 0) speed = current.getSpeed();
        if (strength <= 0 && current.getStrength() != null && current.getStrength() > 0) strength = current.getStrength();
        if (endurance <= 0 && current.getEndurance() != null && current.getEndurance() > 0) endurance = current.getEndurance();
        if (agility <= 0 && current.getAgility() != null && current.getAgility() > 0) agility = current.getAgility();

        Performance updated = performanceService.updatePerformance(userId, speed, strength, endurance, agility);

        activityService.createActivity(
                userId,
                "performance_sync",
                "Scores Calibrated from Personal Records",
                "Your performance ratings were updated to match your verified combine tests.",
                "⚡"
        );

        return updated;
    }

    /**
     * Gets historical attempts for a single drill code.
     */
    public List<PerformanceDrill> getDrillHistory(String userId, String drillCode) {
        return drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtAsc(userId, drillCode);
    }

    /**
     * Deletes a drill attempt and recalculates the PR if that attempt was the PR.
     */
    public boolean deleteDrill(String drillId, String userId) {
        Optional<PerformanceDrill> drillOpt = drillRepository.findByIdAndUserId(drillId, userId);
        if (drillOpt.isEmpty()) {
            return false;
        }

        PerformanceDrill drill = drillOpt.get();
        boolean wasPr = Boolean.TRUE.equals(drill.getIsPersonalRecord());
        String drillCode = drill.getDrillCode();
        boolean lowerIsBetter = drill.getLowerIsBetter() != null && drill.getLowerIsBetter();

        drillRepository.delete(drill);

        if (wasPr) {
            // Find remaining attempts and mark the new best as PR
            List<PerformanceDrill> remaining = drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, drillCode);
            if (!remaining.isEmpty()) {
                remaining.sort((a, b) -> {
                    if (a.getValue() == null) return 1;
                    if (b.getValue() == null) return -1;
                    return lowerIsBetter ? Double.compare(a.getValue(), b.getValue()) : Double.compare(b.getValue(), a.getValue());
                });

                PerformanceDrill newBest = remaining.get(0);
                newBest.setIsPersonalRecord(true);
                drillRepository.save(newBest);
            }
        }

        return true;
    }

    /**
     * Reviews and either certifies (APPROVED) or requests re-test (REJECTED) for an athlete's combine drill.
     */
    public PerformanceDrill reviewDrill(String drillId, String coachId, CoachReviewDrillRequest request) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        PerformanceDrill drill = drillRepository.findById(drillId)
                .orElseThrow(() -> new RuntimeException("Drill not found"));

        // Validate coach assignment to athlete (or coach role check)
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, drill.getUserId(), AssignmentStatus.ACTIVE);
        if (!isAssigned && coach.getRole() != Role.COACH) {
            throw new SecurityException("Access Denied: Coach is not assigned to this athlete");
        }

        drill.setVerificationStatus(request.getStatus());
        drill.setCoachFeedback(request.getFeedback());
        drill.setVerifiedAt(LocalDateTime.now());
        drill.setVerifiedByCoachId(coach.getId());
        drill.setVerifiedByCoachName(coach.getFullName());

        if (request.getStatus() == VerificationStatus.APPROVED) {
            drill.setIsCoachVerified(true);

            activityService.createActivity(
                    drill.getUserId(),
                    "drill_approved",
                    "🏆 Combine Test Certified!",
                    "Coach " + coach.getFullName() + " certified your " + drill.getDrillName() + " (" + drill.getValue() + " " + drill.getUnit() + ").",
                    "✔"
            );

            try {
                notificationService.sendNotification(
                        drill.getUserId(),
                        "🏆 Combine Record Certified!",
                        "Coach " + coach.getFullName() + " officially certified your " + drill.getDrillName() + " (" + drill.getValue() + " " + drill.getUnit() + ")!",
                        "ACHIEVEMENT",
                        "/performance"
                );
            } catch (Exception e) {
                log.warn("Notification error: {}", e.getMessage());
            }
        } else if (request.getStatus() == VerificationStatus.REJECTED) {
            drill.setIsCoachVerified(false);

            // If it was marked as PR, re-evaluate PR among remaining valid attempts
            boolean wasPr = Boolean.TRUE.equals(drill.getIsPersonalRecord());
            if (wasPr) {
                drill.setIsPersonalRecord(false);
                drillRepository.save(drill);
                recalculatePrForUserAndDrill(drill.getUserId(), drill.getDrillCode(), drill.getLowerIsBetter());
            }

            String feedbackMsg = request.getFeedback() != null && !request.getFeedback().isBlank()
                    ? request.getFeedback()
                    : "Re-test requested by coach.";

            activityService.createActivity(
                    drill.getUserId(),
                    "drill_rejected",
                    "⚠️ Combine Test Feedback",
                    "Coach " + coach.getFullName() + " reviewed your " + drill.getDrillName() + ": " + feedbackMsg,
                    "⚠️"
            );

            try {
                notificationService.sendNotification(
                        drill.getUserId(),
                        "⚠️ Combine Test Review: " + drill.getDrillName(),
                        "Coach " + coach.getFullName() + " requested a re-test. Feedback: " + feedbackMsg,
                        "PERFORMANCE",
                        "/performance"
                );
            } catch (Exception e) {
                log.warn("Notification error: {}", e.getMessage());
            }
        }

        return drillRepository.save(drill);
    }

    /**
     * Recalculates PR for a specific drill after a rejection or deletion.
     */
    private void recalculatePrForUserAndDrill(String userId, String drillCode, Boolean lowerIsBetter) {
        List<PerformanceDrill> candidates = drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, drillCode)
                .stream()
                .filter(d -> d.getVerificationStatus() != VerificationStatus.REJECTED)
                .collect(Collectors.toList());

        for (PerformanceDrill d : candidates) {
            if (Boolean.TRUE.equals(d.getIsPersonalRecord())) {
                d.setIsPersonalRecord(false);
                drillRepository.save(d);
            }
        }

        if (!candidates.isEmpty()) {
            boolean lower = lowerIsBetter != null && lowerIsBetter;
            candidates.sort((a, b) -> {
                if (a.getValue() == null) return 1;
                if (b.getValue() == null) return -1;
                return lower ? Double.compare(a.getValue(), b.getValue()) : Double.compare(b.getValue(), a.getValue());
            });
            PerformanceDrill newBest = candidates.get(0);
            newBest.setIsPersonalRecord(true);
            drillRepository.save(newBest);
        }
    }

    /**
     * Retrieves all pending drill submissions awaiting review across all active athletes assigned to the coach.
     */
    public List<PendingDrillReviewResponse> getPendingDrillsForCoach(String coachId) {
        List<CoachAthleteAssignment> assignments = assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        if (assignments.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> athleteIds = assignments.stream()
                .map(CoachAthleteAssignment::getAthleteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (athleteIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<PerformanceDrill> pendingDrills = drillRepository.findByUserIdInAndVerificationStatusOrderByRecordedAtDesc(
                athleteIds, VerificationStatus.PENDING
        );

        Map<String, User> userMap = userRepository.findAllById(athleteIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u, (k1, k2) -> k1));

        return pendingDrills.stream().map(drill -> {
            User athlete = userMap.get(drill.getUserId());
            return PendingDrillReviewResponse.builder()
                    .drillId(drill.getId())
                    .athleteId(drill.getUserId())
                    .athleteName(athlete != null ? athlete.getFullName() : "Athlete")
                    .athleteImage(athlete != null ? athlete.getProfileImage() : null)
                    .athleteSport(athlete != null ? athlete.getSport() : null)
                    .drillCode(drill.getDrillCode())
                    .drillName(drill.getDrillName())
                    .category(drill.getCategory())
                    .value(drill.getValue())
                    .unit(drill.getUnit())
                    .lowerIsBetter(drill.getLowerIsBetter())
                    .percentile(drill.getPercentile())
                    .tierBadge(drill.getTierBadge())
                    .proofUrl(drill.getProofUrl())
                    .notes(drill.getNotes())
                    .recordedAt(drill.getRecordedAt())
                    .isPersonalRecord(drill.getIsPersonalRecord())
                    .verificationStatus(drill.getVerificationStatus())
                    .coachFeedback(drill.getCoachFeedback())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves all drill attempts for a specific athlete for the coach view.
     */
    public List<PerformanceDrill> getAthleteDrillsForCoach(String coachId, String athleteId) {
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, AssignmentStatus.ACTIVE);
        if (!isAssigned) {
            throw new SecurityException("Access Denied: Athlete is not assigned to this coach");
        }
        return drillRepository.findByUserIdOrderByRecordedAtDesc(athleteId);
    }

    /**
     * Backwards-compatible verify endpoint.
     */
    public PerformanceDrill verifyDrillByCoach(String drillId, String coachId) {
        return reviewDrill(drillId, coachId, CoachReviewDrillRequest.builder()
                .status(VerificationStatus.APPROVED)
                .feedback("Verified by coach.")
                .build());
    }
}
