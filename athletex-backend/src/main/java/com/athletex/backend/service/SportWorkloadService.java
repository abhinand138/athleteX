package com.athletex.backend.service;

import com.athletex.backend.dto.sport.SportWorkloadRequest;
import com.athletex.backend.dto.sport.SportWorkloadSummaryResponse;
import com.athletex.backend.model.SportWorkloadLog;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.SportWorkloadRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SportWorkloadService {

    private final SportWorkloadRepository sportWorkloadRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final PerformanceService performanceService;

    /**
     * Logs a sport-specific session (Cricket Bowling Workload or Football Match GPS Data).
     */
    public SportWorkloadLog logWorkload(String userId, SportWorkloadRequest request) {
        User athlete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        double matchOvers = request.getMatchOvers() != null ? Math.max(0.0, request.getMatchOvers()) : 0.0;
        double practiceOvers = request.getPracticeOvers() != null ? Math.max(0.0, request.getPracticeOvers()) : 0.0;
        double totalOvers = Math.round((matchOvers + practiceOvers) * 10.0) / 10.0;
        int deliveryCount = (int) Math.round(totalOvers * 6.0);

        SportWorkloadLog logEntry = SportWorkloadLog.builder()
                .userId(userId)
                .sport(request.getSport() != null ? request.getSport().toUpperCase() : "GENERAL")
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .matchOvers(matchOvers)
                .practiceOvers(practiceOvers)
                .totalOvers(totalOvers)
                .deliveryCount(deliveryCount)
                .bowlingSpeedKmh(request.getBowlingSpeedKmh())
                .totalDistanceKm(request.getTotalDistanceKm())
                .highSpeedRunningMeters(request.getHighSpeedRunningMeters())
                .sprintDistanceMeters(request.getSprintDistanceMeters())
                .maxVelocityKmh(request.getMaxVelocityKmh())
                .accelerationsCount(request.getAccelerationsCount())
                .minutesPlayed(request.getMinutesPlayed())
                .rpe(request.getRpe() != null ? request.getRpe() : 7)
                .sessionType(request.getSessionType() != null ? request.getSessionType() : "TRAINING")
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        SportWorkloadLog saved = sportWorkloadRepository.save(logEntry);

        // Record activity feed item
        if ("CRICKET".equalsIgnoreCase(saved.getSport())) {
            activityService.createActivity(
                    userId,
                    "cricket_bowling_logged",
                    "🏏 Bowling Workload Logged",
                    "Logged " + totalOvers + " overs (" + matchOvers + " match, " + practiceOvers + " nets).",
                    "🏏"
            );
        } else if ("FOOTBALL".equalsIgnoreCase(saved.getSport())) {
            activityService.createActivity(
                    userId,
                    "football_gps_logged",
                    "⚽ Match / GPS Load Logged",
                    "Logged " + (saved.getTotalDistanceKm() != null ? saved.getTotalDistanceKm() + "km" : "session") + " with " + (saved.getHighSpeedRunningMeters() != null ? saved.getHighSpeedRunningMeters() + "m HSR" : "high-intensity running") + ".",
                    "⚽"
            );
        }

        // Trigger workout-engine recalibration in background
        try {
            performanceService.recalculatePerformanceFromWorkouts(userId);
        } catch (Exception e) {
            log.warn("Non-blocking performance recalibration skipped: {}", e.getMessage());
        }

        return saved;
    }

    /**
     * Computes real-world sports workload analytics (Fast Bowler ACWR or Football HSR Loads).
     */
    public SportWorkloadSummaryResponse getWorkloadSummary(String userId, String requestedSport) {
        String sport = requestedSport != null && !requestedSport.isBlank() ? requestedSport.toUpperCase() : "CRICKET";
        List<SportWorkloadLog> logs = sportWorkloadRepository.findByUserIdOrderByDateDesc(userId);
        LocalDate today = LocalDate.now();

        // 1. Cricket Fast Bowler Workload (Acute vs Chronic Overs & Lumbar Bone Stress Risk)
        double acute7DayOvers = 0.0;
        double chronic28DayOvers = 0.0;
        double peakBowlingSpeed = 0.0;

        // 2. Football Match / GPS Loads
        double weeklyDistanceKm = 0.0;
        double weeklyHsrM = 0.0;
        double weeklySprintM = 0.0;
        double peakVelocity = 0.0;
        int weeklyMatchMinutes = 0;

        for (SportWorkloadLog l : logs) {
            if (l.getDate() == null) continue;
            long daysAgo = ChronoUnit.DAYS.between(l.getDate(), today);

            // Bowling Calculations
            if (l.getTotalOvers() != null && l.getTotalOvers() > 0) {
                if (daysAgo >= 0 && daysAgo <= 7) {
                    acute7DayOvers += l.getTotalOvers();
                }
                if (daysAgo >= 0 && daysAgo <= 28) {
                    chronic28DayOvers += l.getTotalOvers();
                }
            }
            if (l.getBowlingSpeedKmh() != null && l.getBowlingSpeedKmh() > peakBowlingSpeed) {
                peakBowlingSpeed = l.getBowlingSpeedKmh();
            }

            // Football GPS Calculations
            if (daysAgo >= 0 && daysAgo <= 7) {
                if (l.getTotalDistanceKm() != null) weeklyDistanceKm += l.getTotalDistanceKm();
                if (l.getHighSpeedRunningMeters() != null) weeklyHsrM += l.getHighSpeedRunningMeters();
                if (l.getSprintDistanceMeters() != null) weeklySprintM += l.getSprintDistanceMeters();
                if (l.getMinutesPlayed() != null) weeklyMatchMinutes += l.getMinutesPlayed();
            }
            if (l.getMaxVelocityKmh() != null && l.getMaxVelocityKmh() > peakVelocity) {
                peakVelocity = l.getMaxVelocityKmh();
            }
        }

        // Round cricket stats
        acute7DayOvers = Math.round(acute7DayOvers * 10.0) / 10.0;
        double chronicWeeklyOvers = chronic28DayOvers > 0 ? Math.round((chronic28DayOvers / 4.0) * 10.0) / 10.0 : 0.0;

        // Bowling ACWR (Gabbett / Cricket Australia / ECB Fast Bowling Standard)
        double bowlingAcwr;
        if (chronicWeeklyOvers > 0) {
            bowlingAcwr = Math.round((acute7DayOvers / chronicWeeklyOvers) * 100.0) / 100.0;
        } else if (acute7DayOvers > 0) {
            bowlingAcwr = 1.6;
        } else {
            bowlingAcwr = 1.0;
        }

        String lumbarStatus;
        String lumbarBadge;
        String lumbarRec;
        String maxOversToday;

        if (bowlingAcwr >= 1.5) {
            lumbarStatus = "CRITICAL_LUMBAR_RISK";
            lumbarBadge = "🔴 Critical Bone Stress Risk (>1.5)";
            lumbarRec = "Acute bowling spike detected! 7-day bowling volume is " + bowlingAcwr + "x higher than your 4-week base. High clinical risk of lumbar pars interarticularis bone stress fractures. Strictly limit bowling to max 3-4 overs off a short run-up or take a complete bowling rest day.";
            maxOversToday = "Max 3-4 Overs (Short Run-Up Only)";
        } else if (bowlingAcwr >= 1.3) {
            lumbarStatus = "MODERATE_BUILDUP";
            lumbarBadge = "🟡 Elevated Lumbar Strain (1.3 - 1.5)";
            lumbarRec = "Bowling load is escalating rapidly. Maintain thoracic mobility and core bracing. Avoid back-to-back heavy net spell days.";
            maxOversToday = "Max 6-8 Overs";
        } else if (bowlingAcwr >= 0.8) {
            lumbarStatus = "OPTIMAL_LOAD";
            lumbarBadge = "🟢 Safe Workload Zone (0.8 - 1.3)";
            lumbarRec = "Optimal fast bowling workload. Bone density and muscular capacity are adapting progressively with minimized injury risk.";
            maxOversToday = "10 - 12 Overs Permitted";
        } else {
            lumbarStatus = "UNDERTRAINED";
            lumbarBadge = "🔵 Low Volume Base (<0.8)";
            lumbarRec = "Bowling load is low. If entering a match soon, increase spell lengths progressively to avoid an acute bowling spike.";
            maxOversToday = "6 - 8 Progressive Overs";
        }

        // Football Stats
        weeklyDistanceKm = Math.round(weeklyDistanceKm * 10.0) / 10.0;
        weeklyHsrM = Math.round(weeklyHsrM);
        weeklySprintM = Math.round(weeklySprintM);
        peakVelocity = Math.round(peakVelocity * 10.0) / 10.0;

        double hsrPercent = weeklyDistanceKm > 0
                ? Math.round(((weeklyHsrM / (weeklyDistanceKm * 1000.0)) * 100.0) * 10.0) / 10.0
                : 9.0;

        String fbStatus = weeklyHsrM >= 600.0 ? "MATCH_FIT" : "OPTIMAL_LOAD";
        String fbBadge = weeklyHsrM >= 600.0 ? "🟢 Pro High-Speed Exposure" : "🟡 Moderate High-Speed Load";
        String fbRec = "Weekly High-Speed Running (HSR: " + weeklyHsrM + "m) provides neuromuscular inoculation against hamstring strains during match sprints.";

        return SportWorkloadSummaryResponse.builder()
                .userId(userId)
                .primarySport(sport)
                .acute7DayOvers(acute7DayOvers)
                .chronic28DayWeeklyOvers(chronicWeeklyOvers)
                .bowlingAcwr(bowlingAcwr)
                .lumbarStressStatus(lumbarStatus)
                .lumbarStressBadge(lumbarBadge)
                .lumbarRecommendation(lumbarRec)
                .peakBowlingSpeedKmh(peakBowlingSpeed > 0 ? peakBowlingSpeed : null)
                .maxRecommendedOversToday(maxOversToday)
                .totalDistanceWeeklyKm(weeklyDistanceKm)
                .highSpeedRunningWeeklyM(weeklyHsrM)
                .sprintDistanceWeeklyM(weeklySprintM)
                .peakMatchVelocityKmh(peakVelocity > 0 ? peakVelocity : null)
                .totalMatchMinutesWeekly(weeklyMatchMinutes)
                .hsrPercentageOfDistance(hsrPercent)
                .footballLoadStatus(fbStatus)
                .footballLoadBadge(fbBadge)
                .footballRecommendation(fbRec)
                .recentLogs(logs.stream().limit(10).toList())
                .build();
    }
}
