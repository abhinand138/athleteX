package com.athletex.backend.service;

import com.athletex.backend.dto.analytics.*;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachAnalyticsService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;
    private final TrainingRepository trainingRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityRepository activityRepository;

    public CoachAnalyticsResponse getCoachAnalytics(String coachId, String range) {
        // 1. Verify coach
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }

        // 2. Fetch active assigned athletes
        List<CoachAthleteAssignment> activeAssignments = assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        List<String> athleteIds = activeAssignments.stream()
                .map(CoachAthleteAssignment::getAthleteId)
                .filter(Objects::nonNull)
                .toList();

        Map<String, User> athleteUserMap = userRepository.findAllById(athleteIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<RosterAthleteOptionDto> rosterOptions = athleteIds.stream()
                .map(id -> {
                    User u = athleteUserMap.get(id);
                    return RosterAthleteOptionDto.builder()
                            .id(id)
                            .fullName(u != null && u.getFullName() != null ? u.getFullName() : "Athlete")
                            .sport(u != null && u.getSport() != null ? u.getSport() : "Athlete")
                            .build();
                })
                .collect(Collectors.toList());

        // 3. Date range filtering threshold
        LocalDate dateThreshold = calculateDateThreshold(range);
        LocalDateTime dateTimeThreshold = dateThreshold != null ? dateThreshold.atStartOfDay() : null;

        // 4. Performance & Trends & Category Analysis
        List<PerformanceTrendPoint> performanceTrends = new ArrayList<>();
        double totalOverallScore = 0.0;
        int performanceCount = 0;

        double sumSpeed = 0.0, maxSpeed = 0.0;
        double sumStrength = 0.0, maxStrength = 0.0;
        double sumEndurance = 0.0, maxEndurance = 0.0;
        double sumAgility = 0.0, maxAgility = 0.0;
        int categoryRecordCount = 0;

        Map<String, List<PerformanceHistory>> athleteHistoryMap = new HashMap<>();
        Map<String, Performance> athletePerfMap = new HashMap<>();

        for (String athleteId : athleteIds) {
            User athleteUser = athleteUserMap.get(athleteId);
            String athleteName = athleteUser != null && athleteUser.getFullName() != null ? athleteUser.getFullName() : "Athlete";

            // Current performance
            Optional<Performance> perfOpt = performanceRepository.findByUserId(athleteId);
            if (perfOpt.isPresent()) {
                Performance p = perfOpt.get();
                athletePerfMap.put(athleteId, p);

                double score = p.getOverallScore() != null ? p.getOverallScore() : 0.0;
                double spd = p.getSpeed() != null ? p.getSpeed() : 0.0;
                double str = p.getStrength() != null ? p.getStrength() : 0.0;
                double end = p.getEndurance() != null ? p.getEndurance() : 0.0;
                double agi = p.getAgility() != null ? p.getAgility() : 0.0;

                totalOverallScore += score;
                performanceCount++;

                sumSpeed += spd;
                maxSpeed = Math.max(maxSpeed, spd);

                sumStrength += str;
                maxStrength = Math.max(maxStrength, str);

                sumEndurance += end;
                maxEndurance = Math.max(maxEndurance, end);

                sumAgility += agi;
                maxAgility = Math.max(maxAgility, agi);

                categoryRecordCount++;
            }

            // History
            List<PerformanceHistory> history = performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(athleteId);
            if (history != null && !history.isEmpty()) {
                athleteHistoryMap.put(athleteId, history);
                for (PerformanceHistory h : history) {
                    if (dateTimeThreshold == null || (h.getRecordedAt() != null && !h.getRecordedAt().isBefore(dateTimeThreshold))) {
                        String formattedDate = h.getRecordedAt() != null
                                ? h.getRecordedAt().format(DateTimeFormatter.ofPattern("MMM dd"))
                                : "N/A";
                        performanceTrends.add(PerformanceTrendPoint.builder()
                                .date(formattedDate)
                                .athleteId(athleteId)
                                .athleteName(athleteName)
                                .score(h.getOverallScore() != null ? h.getOverallScore() : 0.0)
                                .speed(h.getSpeed() != null ? h.getSpeed() : 0.0)
                                .strength(h.getStrength() != null ? h.getStrength() : 0.0)
                                .endurance(h.getEndurance() != null ? h.getEndurance() : 0.0)
                                .agility(h.getAgility() != null ? h.getAgility() : 0.0)
                                .build());
                    }
                }
            }
        }

        double avgPerformance = performanceCount > 0 ? Math.round((totalOverallScore / performanceCount) * 10.0) / 10.0 : 0.0;

        List<CategoryAnalysisDto> categoryAnalysis = List.of(
                CategoryAnalysisDto.builder()
                        .category("Speed")
                        .avgScore(categoryRecordCount > 0 ? Math.round((sumSpeed / categoryRecordCount) * 10.0) / 10.0 : 0.0)
                        .topScore(Math.round(maxSpeed * 10.0) / 10.0)
                        .recordCount(categoryRecordCount)
                        .build(),
                CategoryAnalysisDto.builder()
                        .category("Strength")
                        .avgScore(categoryRecordCount > 0 ? Math.round((sumStrength / categoryRecordCount) * 10.0) / 10.0 : 0.0)
                        .topScore(Math.round(maxStrength * 10.0) / 10.0)
                        .recordCount(categoryRecordCount)
                        .build(),
                CategoryAnalysisDto.builder()
                        .category("Endurance")
                        .avgScore(categoryRecordCount > 0 ? Math.round((sumEndurance / categoryRecordCount) * 10.0) / 10.0 : 0.0)
                        .topScore(Math.round(maxEndurance * 10.0) / 10.0)
                        .recordCount(categoryRecordCount)
                        .build(),
                CategoryAnalysisDto.builder()
                        .category("Agility")
                        .avgScore(categoryRecordCount > 0 ? Math.round((sumAgility / categoryRecordCount) * 10.0) / 10.0 : 0.0)
                        .topScore(Math.round(maxAgility * 10.0) / 10.0)
                        .recordCount(categoryRecordCount)
                        .build()
        );

        // 5. Training Analytics
        List<Training> coachTrainings = trainingRepository.findByCoachIdOrderByDateAscTimeAsc(coachId);
        if (dateThreshold != null && coachTrainings != null) {
            coachTrainings = coachTrainings.stream()
                    .filter(t -> t.getDate() == null || !t.getDate().isBefore(dateThreshold))
                    .collect(Collectors.toList());
        }

        long scheduledTrainings = 0;
        long completedTrainings = 0;
        long cancelledTrainings = 0;
        Map<String, MonthlyTrainingDto> monthMap = new LinkedHashMap<>();

        if (coachTrainings != null) {
            for (Training t : coachTrainings) {
                if (t.getStatus() == TrainingStatus.SCHEDULED) scheduledTrainings++;
                else if (t.getStatus() == TrainingStatus.COMPLETED) completedTrainings++;
                else if (t.getStatus() == TrainingStatus.CANCELLED) cancelledTrainings++;

                if (t.getDate() != null) {
                    String monthKey = t.getDate().format(DateTimeFormatter.ofPattern("MMM yyyy"));
                    MonthlyTrainingDto mDto = monthMap.computeIfAbsent(monthKey, k -> MonthlyTrainingDto.builder()
                            .month(k)
                            .scheduled(0)
                            .completed(0)
                            .cancelled(0)
                            .build());

                    if (t.getStatus() == TrainingStatus.SCHEDULED) mDto.setScheduled(mDto.getScheduled() + 1);
                    else if (t.getStatus() == TrainingStatus.COMPLETED) mDto.setCompleted(mDto.getCompleted() + 1);
                    else if (t.getStatus() == TrainingStatus.CANCELLED) mDto.setCancelled(mDto.getCancelled() + 1);
                }
            }
        }

        long totalTrainings = scheduledTrainings + completedTrainings + cancelledTrainings;
        double trainingCompletionRate = totalTrainings > 0
                ? Math.round((completedTrainings * 100.0 / totalTrainings) * 10.0) / 10.0
                : 0.0;

        TrainingAnalyticsDto trainingAnalytics = TrainingAnalyticsDto.builder()
                .totalTrainings(totalTrainings)
                .scheduled(scheduledTrainings)
                .completed(completedTrainings)
                .cancelled(cancelledTrainings)
                .completionRate(trainingCompletionRate)
                .monthlyDistribution(new ArrayList<>(monthMap.values()))
                .build();

        // 6. Achievement Analytics
        List<Achievement> achievements = achievementRepository.findByCoachIdOrderByDateDesc(coachId);
        if (dateThreshold != null && achievements != null) {
            achievements = achievements.stream()
                    .filter(a -> a.getDate() == null || !a.getDate().isBefore(dateThreshold))
                    .collect(Collectors.toList());
        }

        long championships = 0, medals = 0, records = 0, milestones = 0, awards = 0, otherAch = 0;
        if (achievements != null) {
            for (Achievement a : achievements) {
                String cat = a.getCategory() != null ? a.getCategory().toUpperCase() : "OTHER";
                switch (cat) {
                    case "CHAMPIONSHIP" -> championships++;
                    case "MEDAL" -> medals++;
                    case "RECORD" -> records++;
                    case "MILESTONE" -> milestones++;
                    case "AWARD" -> awards++;
                    default -> otherAch++;
                }
            }
        }
        long totalAchievements = (achievements != null) ? achievements.size() : 0;

        List<AchievementCategoryCountDto> achievementDistribution = List.of(
                new AchievementCategoryCountDto("Championship", championships),
                new AchievementCategoryCountDto("Medal", medals),
                new AchievementCategoryCountDto("Record", records),
                new AchievementCategoryCountDto("Milestone", milestones),
                new AchievementCategoryCountDto("Award", awards),
                new AchievementCategoryCountDto("Other", otherAch)
        );

        AchievementAnalyticsDto achievementAnalytics = AchievementAnalyticsDto.builder()
                .totalAchievements(totalAchievements)
                .championships(championships)
                .medals(medals)
                .records(records)
                .milestones(milestones)
                .awards(awards)
                .other(otherAch)
                .distribution(achievementDistribution)
                .build();

        // 7. Top Athletes & Athletes Needing Attention
        List<TopAthleteDto> topAthletesList = new ArrayList<>();
        List<AthleteAttentionDto> attentionList = new ArrayList<>();

        for (String athleteId : athleteIds) {
            User u = athleteUserMap.get(athleteId);
            String name = u != null && u.getFullName() != null ? u.getFullName() : "Athlete";
            String profileImg = u != null ? u.getProfileImage() : "";
            String sport = u != null && u.getSport() != null ? u.getSport() : "Athlete";

            Performance p = athletePerfMap.get(athleteId);
            double perfScore = p != null && p.getOverallScore() != null ? p.getOverallScore() : 0.0;

            // Athlete training completion
            List<Training> athleteTrainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(athleteId);
            long aCompleted = 0, aTotal = 0;
            if (athleteTrainings != null) {
                for (Training t : athleteTrainings) {
                    if (coachId.equals(t.getCoachId())) {
                        aTotal++;
                        if (t.getStatus() == TrainingStatus.COMPLETED) aCompleted++;
                    }
                }
            }
            double aCompRate = aTotal > 0 ? Math.round((aCompleted * 100.0 / aTotal) * 10.0) / 10.0 : 0.0;

            // Athlete achievement count
            long aAchCount = achievementRepository.countByAthleteId(athleteId);
            if (aAchCount == 0) aAchCount = achievementRepository.countByUserId(athleteId);

            // Determine Trend
            String trend = "NEUTRAL";
            List<PerformanceHistory> hist = athleteHistoryMap.get(athleteId);
            if (hist != null && hist.size() >= 2) {
                double latest = hist.get(hist.size() - 1).getOverallScore() != null ? hist.get(hist.size() - 1).getOverallScore() : 0.0;
                double prev = hist.get(hist.size() - 2).getOverallScore() != null ? hist.get(hist.size() - 2).getOverallScore() : 0.0;
                if (latest > prev + 1.0) trend = "UP";
                else if (latest < prev - 1.0) trend = "DOWN";
            }

            topAthletesList.add(TopAthleteDto.builder()
                    .athleteId(athleteId)
                    .name(name)
                    .profileImage(profileImg)
                    .sport(sport)
                    .performanceScore(perfScore)
                    .trainingCompletionRate(aCompRate)
                    .achievementCount(aAchCount)
                    .trend(trend)
                    .build());

            // Check Attention Triggers
            if (aTotal > 0 && aCompRate < 50.0) {
                attentionList.add(AthleteAttentionDto.builder()
                        .athleteId(athleteId)
                        .name(name)
                        .profileImage(profileImg)
                        .sport(sport)
                        .reason("Training completion rate is " + aCompRate + "% (" + aCompleted + "/" + aTotal + " sessions)")
                        .performanceScore(perfScore)
                        .completionRate(aCompRate)
                        .severity("HIGH")
                        .build());
            } else if ("DOWN".equals(trend)) {
                attentionList.add(AthleteAttentionDto.builder()
                        .athleteId(athleteId)
                        .name(name)
                        .profileImage(profileImg)
                        .sport(sport)
                        .reason("Performance score declined across recent assessments")
                        .performanceScore(perfScore)
                        .completionRate(aCompRate)
                        .severity("MEDIUM")
                        .build());
            } else if (perfScore > 0 && perfScore < 60.0) {
                attentionList.add(AthleteAttentionDto.builder()
                        .athleteId(athleteId)
                        .name(name)
                        .profileImage(profileImg)
                        .sport(sport)
                        .reason("Overall performance (" + perfScore + "%) is below target readiness threshold")
                        .performanceScore(perfScore)
                        .completionRate(aCompRate)
                        .severity("MEDIUM")
                        .build());
            } else if (aTotal == 0 && perfScore == 0) {
                attentionList.add(AthleteAttentionDto.builder()
                        .athleteId(athleteId)
                        .name(name)
                        .profileImage(profileImg)
                        .sport(sport)
                        .reason("No training sessions or performance records recorded yet")
                        .performanceScore(perfScore)
                        .completionRate(aCompRate)
                        .severity("MEDIUM")
                        .build());
            }
        }

        // Rank Top Athletes
        topAthletesList.sort((a, b) -> {
            int cmp = Double.compare(b.getPerformanceScore(), a.getPerformanceScore());
            if (cmp != 0) return cmp;
            return Double.compare(b.getTrainingCompletionRate(), a.getTrainingCompletionRate());
        });
        for (int i = 0; i < topAthletesList.size(); i++) {
            topAthletesList.get(i).setRank(i + 1);
        }

        // 8. Recent Activity for Roster
        List<RecentActivityDto> recentActivities = new ArrayList<>();
        for (String athleteId : athleteIds) {
            User athleteUser = athleteUserMap.get(athleteId);
            String aName = athleteUser != null && athleteUser.getFullName() != null ? athleteUser.getFullName() : "Athlete";

            List<Activity> acts = activityRepository.findByUserIdOrderByTimestampDesc(athleteId);
            if (acts != null) {
                for (Activity act : acts) {
                    if (dateTimeThreshold == null || (act.getTimestamp() != null && !act.getTimestamp().isBefore(dateTimeThreshold))) {
                        recentActivities.add(RecentActivityDto.builder()
                                .id(act.getId())
                                .athleteId(athleteId)
                                .athleteName(aName)
                                .type(act.getType())
                                .title(act.getTitle())
                                .description(act.getDescription())
                                .icon(act.getIcon())
                                .timestamp(act.getTimestamp())
                                .build());
                    }
                }
            }
        }
        recentActivities.sort((a, b) -> {
            if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });
        if (recentActivities.size() > 15) {
            recentActivities = recentActivities.subList(0, 15);
        }

        // 9. Coach Summary
        CoachAnalyticsSummary summary = CoachAnalyticsSummary.builder()
                .totalAthletes(athleteIds.size())
                .activeTrainingSessions(scheduledTrainings)
                .completedTrainings(completedTrainings)
                .totalAchievements(totalAchievements)
                .averagePerformance(avgPerformance)
                .trainingCompletionRate(trainingCompletionRate)
                .build();

        return CoachAnalyticsResponse.builder()
                .summary(summary)
                .performanceTrends(performanceTrends)
                .categoryAnalysis(categoryAnalysis)
                .trainingAnalytics(trainingAnalytics)
                .achievementAnalytics(achievementAnalytics)
                .topAthletes(topAthletesList)
                .athletesNeedingAttention(attentionList)
                .recentActivity(recentActivities)
                .assignedAthletesList(rosterOptions)
                .build();
    }

    public List<AthleteComparisonDto> getAthleteComparison(String coachId, List<String> athleteIds) {
        if (athleteIds == null || athleteIds.isEmpty()) {
            return Collections.emptyList();
        }

        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }

        List<AthleteComparisonDto> comparisonList = new ArrayList<>();
        for (String aId : athleteIds) {
            boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                    coachId, aId, AssignmentStatus.ACTIVE
            );
            if (!isAssigned) {
                continue; // Skip unauthorized
            }

            User athlete = userRepository.findById(aId).orElse(null);
            if (athlete == null) continue;

            Optional<Performance> perfOpt = performanceRepository.findByUserId(aId);
            double score = 0.0, speed = 0.0, strength = 0.0, endurance = 0.0, agility = 0.0;
            if (perfOpt.isPresent()) {
                Performance p = perfOpt.get();
                score = p.getOverallScore() != null ? p.getOverallScore() : 0.0;
                speed = p.getSpeed() != null ? p.getSpeed() : 0.0;
                strength = p.getStrength() != null ? p.getStrength() : 0.0;
                endurance = p.getEndurance() != null ? p.getEndurance() : 0.0;
                agility = p.getAgility() != null ? p.getAgility() : 0.0;
            }

            List<Training> aTrainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(aId);
            long comp = 0, tot = 0;
            if (aTrainings != null) {
                for (Training t : aTrainings) {
                    if (coachId.equals(t.getCoachId())) {
                        tot++;
                        if (t.getStatus() == TrainingStatus.COMPLETED) comp++;
                    }
                }
            }
            double compRate = tot > 0 ? Math.round((comp * 100.0 / tot) * 10.0) / 10.0 : 0.0;

            long achCount = achievementRepository.countByAthleteId(aId);
            if (achCount == 0) achCount = achievementRepository.countByUserId(aId);

            comparisonList.add(AthleteComparisonDto.builder()
                    .athleteId(aId)
                    .athleteName(athlete.getFullName() != null ? athlete.getFullName() : "Athlete")
                    .sport(athlete.getSport() != null ? athlete.getSport() : "Athlete")
                    .profileImage(athlete.getProfileImage() != null ? athlete.getProfileImage() : "")
                    .overallScore(score)
                    .speed(speed)
                    .strength(strength)
                    .endurance(endurance)
                    .agility(agility)
                    .completionRate(compRate)
                    .achievementCount(achCount)
                    .build());
        }

        return comparisonList;
    }

    private LocalDate calculateDateThreshold(String range) {
        if (range == null || range.equalsIgnoreCase("all")) return null;
        return switch (range.toLowerCase()) {
            case "7d" -> LocalDate.now().minusDays(7);
            case "30d" -> LocalDate.now().minusDays(30);
            case "3m" -> LocalDate.now().minusMonths(3);
            case "1y" -> LocalDate.now().minusYears(1);
            default -> LocalDate.now().minusDays(30);
        };
    }
}
