package com.athletex.backend.service;

import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.analytics.*;
import com.athletex.backend.dto.reports.*;
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
public class CoachReportService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final PerformanceRepository performanceRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;
    private final TrainingRepository trainingRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityRepository activityRepository;
    private final CoachAnalyticsService coachAnalyticsService;
    private final AchievementService achievementService;

    // =========================================================================
    // 1. INDIVIDUAL ATHLETE REPORT
    // =========================================================================
    public IndividualAthleteReportDto getIndividualAthleteReport(
            String coachId, String athleteId, String range, LocalDate startDate, LocalDate endDate) {

        User coach = verifyCoach(coachId);
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        if (athlete.getRole() != Role.ATHLETE) {
            throw new RuntimeException("User is not an athlete");
        }

        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                coachId, athleteId, AssignmentStatus.ACTIVE
        );
        if (!isAssigned) {
            throw new SecurityException("Access Denied: Athlete is not assigned to this coach");
        }

        LocalDate dateThreshold = resolveDateThreshold(range, startDate, endDate);
        LocalDateTime dateTimeThreshold = dateThreshold != null ? dateThreshold.atStartOfDay() : null;

        // Performance
        Optional<Performance> perfOpt = performanceRepository.findByUserId(athleteId);
        double overallScore = 0.0, speed = 0.0, strength = 0.0, endurance = 0.0, agility = 0.0;
        if (perfOpt.isPresent()) {
            Performance p = perfOpt.get();
            overallScore = p.getOverallScore() != null ? p.getOverallScore() : 0.0;
            speed = p.getSpeed() != null ? p.getSpeed() : 0.0;
            strength = p.getStrength() != null ? p.getStrength() : 0.0;
            endurance = p.getEndurance() != null ? p.getEndurance() : 0.0;
            agility = p.getAgility() != null ? p.getAgility() : 0.0;
        }

        // Performance History & Trend
        List<PerformanceHistory> history = performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(athleteId);
        double prevScore = overallScore;
        double changePct = 0.0;
        String trend = "NEUTRAL";
        List<PerformanceTrendPoint> progressionList = new ArrayList<>();

        if (history != null && !history.isEmpty()) {
            if (history.size() >= 2) {
                prevScore = history.get(history.size() - 2).getOverallScore() != null
                        ? history.get(history.size() - 2).getOverallScore() : overallScore;
                double diff = overallScore - prevScore;
                changePct = prevScore > 0 ? Math.round((diff / prevScore) * 1000.0) / 10.0 : 0.0;
                if (diff > 0.5) trend = "UP";
                else if (diff < -0.5) trend = "DOWN";
            }

            for (PerformanceHistory h : history) {
                if (dateTimeThreshold == null || (h.getRecordedAt() != null && !h.getRecordedAt().isBefore(dateTimeThreshold))) {
                    progressionList.add(PerformanceTrendPoint.builder()
                            .date(h.getRecordedAt() != null ? h.getRecordedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "N/A")
                            .athleteId(athleteId)
                            .athleteName(athlete.getFullName())
                            .score(h.getOverallScore() != null ? h.getOverallScore() : 0.0)
                            .speed(h.getSpeed() != null ? h.getSpeed() : 0.0)
                            .strength(h.getStrength() != null ? h.getStrength() : 0.0)
                            .endurance(h.getEndurance() != null ? h.getEndurance() : 0.0)
                            .agility(h.getAgility() != null ? h.getAgility() : 0.0)
                            .build());
                }
            }
        }

        // Training Summary
        List<Training> athleteTrainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(athleteId);
        long totalTr = 0, compTr = 0, schedTr = 0, cancTr = 0;
        if (athleteTrainings != null) {
            for (Training t : athleteTrainings) {
                if (coachId.equals(t.getCoachId())) {
                    if (dateThreshold == null || (t.getDate() != null && !t.getDate().isBefore(dateThreshold))) {
                        totalTr++;
                        if (t.getStatus() == TrainingStatus.COMPLETED) compTr++;
                        else if (t.getStatus() == TrainingStatus.SCHEDULED) schedTr++;
                        else if (t.getStatus() == TrainingStatus.CANCELLED) cancTr++;
                    }
                }
            }
        }
        double trCompRate = totalTr > 0 ? Math.round((compTr * 100.0 / totalTr) * 10.0) / 10.0 : 0.0;

        // Achievement Summary
        List<AchievementResponse> athleteAchievements = achievementService.getAchievementsByAthlete(athleteId);
        if (dateThreshold != null && athleteAchievements != null) {
            athleteAchievements = athleteAchievements.stream()
                    .filter(a -> a.getDate() == null || !a.getDate().isBefore(dateThreshold))
                    .collect(Collectors.toList());
        }

        long champ = 0, medals = 0, records = 0, miles = 0, awards = 0, otherAch = 0;
        if (athleteAchievements != null) {
            for (AchievementResponse a : athleteAchievements) {
                String cat = a.getCategory() != null ? a.getCategory().toUpperCase() : "OTHER";
                switch (cat) {
                    case "CHAMPIONSHIP" -> champ++;
                    case "MEDAL" -> medals++;
                    case "RECORD" -> records++;
                    case "MILESTONE" -> miles++;
                    case "AWARD" -> awards++;
                    default -> otherAch++;
                }
            }
        }
        long totAch = athleteAchievements != null ? athleteAchievements.size() : 0;

        // Recent Activity
        List<Activity> acts = activityRepository.findByUserIdOrderByTimestampDesc(athleteId);
        List<RecentActivityDto> recentActs = new ArrayList<>();
        if (acts != null) {
            for (Activity a : acts) {
                if (dateTimeThreshold == null || (a.getTimestamp() != null && !a.getTimestamp().isBefore(dateTimeThreshold))) {
                    recentActs.add(RecentActivityDto.builder()
                            .id(a.getId())
                            .athleteId(athleteId)
                            .athleteName(athlete.getFullName())
                            .type(a.getType())
                            .title(a.getTitle())
                            .description(a.getDescription())
                            .icon(a.getIcon())
                            .timestamp(a.getTimestamp())
                            .build());
                }
            }
        }

        return IndividualAthleteReportDto.builder()
                .athleteId(athlete.getId())
                .athleteName(athlete.getFullName())
                .email(athlete.getEmail())
                .phone(athlete.getPhone())
                .profileImage(athlete.getProfileImage())
                .age(athlete.getAge())
                .gender(athlete.getGender())
                .sport(athlete.getSport())
                .position(athlete.getPosition())
                .height(athlete.getHeight())
                .weight(athlete.getWeight())
                .city(athlete.getCity())
                .state(athlete.getState())
                .country(athlete.getCountry())
                .bio(athlete.getBio())
                .coachName(coach.getFullName())
                .overallScore(overallScore)
                .speed(speed)
                .strength(strength)
                .endurance(endurance)
                .agility(agility)
                .previousScore(prevScore)
                .changePercentage(changePct)
                .trend(trend)
                .progressionHistory(progressionList)
                .totalTrainings(totalTr)
                .completedTrainings(compTr)
                .scheduledTrainings(schedTr)
                .cancelledTrainings(cancTr)
                .trainingCompletionRate(trCompRate)
                .totalAchievements(totAch)
                .championships(champ)
                .medals(medals)
                .records(records)
                .milestones(miles)
                .awards(awards)
                .otherAchievements(otherAch)
                .achievementsList(athleteAchievements)
                .recentActivities(recentActs)
                .build();
    }

    // =========================================================================
    // 2. TEAM / ROSTER PERFORMANCE REPORT
    // =========================================================================
    public TeamReportDto getTeamReport(String coachId, String range, LocalDate startDate, LocalDate endDate) {
        verifyCoach(coachId);
        CoachAnalyticsResponse analytics = coachAnalyticsService.getCoachAnalytics(coachId, range != null ? range : "30d");

        return TeamReportDto.builder()
                .teamSummary(analytics.getSummary())
                .athleteRankings(analytics.getTopAthletes())
                .categoryAverages(analytics.getCategoryAnalysis())
                .trainingDistribution(analytics.getTrainingAnalytics())
                .achievementDistribution(analytics.getAchievementAnalytics())
                .build();
    }

    // =========================================================================
    // 3. TRAINING REPORT
    // =========================================================================
    public TrainingReportDto getTrainingReport(String coachId, String range, LocalDate startDate, LocalDate endDate) {
        verifyCoach(coachId);
        LocalDate dateThreshold = resolveDateThreshold(range, startDate, endDate);

        List<Training> coachTrainings = trainingRepository.findByCoachIdOrderByDateAscTimeAsc(coachId);
        if (dateThreshold != null && coachTrainings != null) {
            coachTrainings = coachTrainings.stream()
                    .filter(t -> t.getDate() == null || !t.getDate().isBefore(dateThreshold))
                    .collect(Collectors.toList());
        }

        long sched = 0, comp = 0, canc = 0;
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        categoryMap.put("Speed", 0L);
        categoryMap.put("Strength", 0L);
        categoryMap.put("Endurance", 0L);
        categoryMap.put("Agility", 0L);
        categoryMap.put("Recovery", 0L);
        categoryMap.put("General", 0L);

        Map<String, MonthlyTrainingDto> monthMap = new LinkedHashMap<>();
        Map<String, long[]> athleteTrainingCounts = new HashMap<>(); // athleteId -> [total, comp, sched, canc]

        if (coachTrainings != null) {
            for (Training t : coachTrainings) {
                if (t.getStatus() == TrainingStatus.SCHEDULED) sched++;
                else if (t.getStatus() == TrainingStatus.COMPLETED) comp++;
                else if (t.getStatus() == TrainingStatus.CANCELLED) canc++;

                String cat = t.getCategory() != null ? t.getCategory() : "General";
                categoryMap.put(cat, categoryMap.getOrDefault(cat, 0L) + 1);

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

                if (t.getAthleteId() != null) {
                    long[] counts = athleteTrainingCounts.computeIfAbsent(t.getAthleteId(), k -> new long[4]);
                    counts[0]++; // total
                    if (t.getStatus() == TrainingStatus.COMPLETED) counts[1]++;
                    else if (t.getStatus() == TrainingStatus.SCHEDULED) counts[2]++;
                    else if (t.getStatus() == TrainingStatus.CANCELLED) counts[3]++;
                }
            }
        }

        long total = sched + comp + canc;
        double compRate = total > 0 ? Math.round((comp * 100.0 / total) * 10.0) / 10.0 : 0.0;

        final List<Training> finalCoachTrainings = coachTrainings;
        List<TrainingCategoryStatDto> categoryBreakdown = categoryMap.entrySet().stream()
                .map(e -> TrainingCategoryStatDto.builder()
                        .category(e.getKey())
                        .totalSessions(e.getValue())
                        .completed(finalCoachTrainings != null ? finalCoachTrainings.stream().filter(t -> e.getKey().equalsIgnoreCase(t.getCategory()) && t.getStatus() == TrainingStatus.COMPLETED).count() : 0)
                        .build())
                .collect(Collectors.toList());

        List<CoachAthleteAssignment> activeAssignments = assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        List<AthleteTrainingStatDto> athleteStats = new ArrayList<>();

        for (CoachAthleteAssignment a : activeAssignments) {
            String aId = a.getAthleteId();
            User u = userRepository.findById(aId).orElse(null);
            if (u != null) {
                long[] counts = athleteTrainingCounts.getOrDefault(aId, new long[4]);
                long aTot = counts[0], aComp = counts[1], aSched = counts[2], aCanc = counts[3];
                double aRate = aTot > 0 ? Math.round((aComp * 100.0 / aTot) * 10.0) / 10.0 : 0.0;

                athleteStats.add(AthleteTrainingStatDto.builder()
                        .athleteId(aId)
                        .athleteName(u.getFullName())
                        .sport(u.getSport())
                        .totalSessions(aTot)
                        .completed(aComp)
                        .scheduled(aSched)
                        .cancelled(aCanc)
                        .completionRate(aRate)
                        .build());
            }
        }

        return TrainingReportDto.builder()
                .totalTrainings(total)
                .scheduled(sched)
                .completed(comp)
                .cancelled(canc)
                .completionRate(compRate)
                .categoryBreakdown(categoryBreakdown)
                .monthlyVolume(new ArrayList<>(monthMap.values()))
                .athleteTrainingStats(athleteStats)
                .build();
    }

    // =========================================================================
    // 4. ACHIEVEMENT REPORT
    // =========================================================================
    public AchievementReportDto getAchievementReport(String coachId, String range, LocalDate startDate, LocalDate endDate) {
        verifyCoach(coachId);
        LocalDate dateThreshold = resolveDateThreshold(range, startDate, endDate);

        List<AchievementResponse> coachAchievements = achievementService.getAchievementsByCoach(coachId);
        if (dateThreshold != null && coachAchievements != null) {
            coachAchievements = coachAchievements.stream()
                    .filter(a -> a.getDate() == null || !a.getDate().isBefore(dateThreshold))
                    .collect(Collectors.toList());
        }

        long champ = 0, medals = 0, records = 0, miles = 0, awards = 0, otherAch = 0;
        Map<String, long[]> athleteAchMap = new HashMap<>(); // athleteId -> [total, records, awards]
        Map<String, User> athleteInfo = new HashMap<>();

        if (coachAchievements != null) {
            for (AchievementResponse a : coachAchievements) {
                String cat = a.getCategory() != null ? a.getCategory().toUpperCase() : "OTHER";
                switch (cat) {
                    case "CHAMPIONSHIP" -> champ++;
                    case "MEDAL" -> medals++;
                    case "RECORD" -> records++;
                    case "MILESTONE" -> miles++;
                    case "AWARD" -> awards++;
                    default -> otherAch++;
                }

                if (a.getAthleteId() != null) {
                    long[] counts = athleteAchMap.computeIfAbsent(a.getAthleteId(), k -> new long[3]);
                    counts[0]++; // total
                    if ("RECORD".equalsIgnoreCase(a.getCategory())) counts[1]++;
                    if ("AWARD".equalsIgnoreCase(a.getCategory()) || "CHAMPIONSHIP".equalsIgnoreCase(a.getCategory()) || "MEDAL".equalsIgnoreCase(a.getCategory())) counts[2]++;

                    if (!athleteInfo.containsKey(a.getAthleteId())) {
                        userRepository.findById(a.getAthleteId()).ifPresent(u -> athleteInfo.put(a.getAthleteId(), u));
                    }
                }
            }
        }

        long total = (coachAchievements != null) ? coachAchievements.size() : 0;

        List<AchievementCategoryCountDto> distribution = List.of(
                new AchievementCategoryCountDto("Championship", champ),
                new AchievementCategoryCountDto("Medal", medals),
                new AchievementCategoryCountDto("Record", records),
                new AchievementCategoryCountDto("Milestone", miles),
                new AchievementCategoryCountDto("Award", awards),
                new AchievementCategoryCountDto("Other", otherAch)
        );

        List<AchievementLeaderboardDto> leaderboard = athleteAchMap.entrySet().stream()
                .map(e -> {
                    User u = athleteInfo.get(e.getKey());
                    return AchievementLeaderboardDto.builder()
                            .athleteId(e.getKey())
                            .athleteName(u != null && u.getFullName() != null ? u.getFullName() : "Athlete")
                            .sport(u != null && u.getSport() != null ? u.getSport() : "Athlete")
                            .totalAchievements(e.getValue()[0])
                            .records(e.getValue()[1])
                            .awards(e.getValue()[2])
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalAchievements(), a.getTotalAchievements()))
                .collect(Collectors.toList());

        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).setRank(i + 1);
        }

        return AchievementReportDto.builder()
                .totalAchievements(total)
                .championships(champ)
                .medals(medals)
                .records(records)
                .milestones(miles)
                .awards(awards)
                .other(otherAch)
                .categoryDistribution(distribution)
                .leaderboard(leaderboard)
                .timeline(coachAchievements)
                .build();
    }

    // =========================================================================
    // 5. CSV EXPORT GENERATORS
    // =========================================================================
    public String generateAthleteCsv(String coachId, String athleteId, String range) {
        IndividualAthleteReportDto report = getIndividualAthleteReport(coachId, athleteId, range, null, null);
        StringBuilder csv = new StringBuilder();
        csv.append("AthleteX - Individual Athlete Performance Report\n");
        csv.append("Athlete Name,").append(escapeCsv(report.getAthleteName())).append("\n");
        csv.append("Sport,").append(escapeCsv(report.getSport())).append("\n");
        csv.append("Coach,").append(escapeCsv(report.getCoachName())).append("\n");
        csv.append("Overall Score,").append(report.getOverallScore()).append("%\n");
        csv.append("Speed,").append(report.getSpeed()).append("%\n");
        csv.append("Strength,").append(report.getStrength()).append("%\n");
        csv.append("Endurance,").append(report.getEndurance()).append("%\n");
        csv.append("Agility,").append(report.getAgility()).append("%\n");
        csv.append("Training Completion Rate,").append(report.getTrainingCompletionRate()).append("%\n");
        csv.append("Total Achievements,").append(report.getTotalAchievements()).append("\n\n");

        csv.append("Performance Progression History\n");
        csv.append("Date,Score,Speed,Strength,Endurance,Agility\n");
        if (report.getProgressionHistory() != null) {
            for (PerformanceTrendPoint p : report.getProgressionHistory()) {
                csv.append(escapeCsv(p.getDate())).append(",")
                        .append(p.getScore()).append(",")
                        .append(p.getSpeed()).append(",")
                        .append(p.getStrength()).append(",")
                        .append(p.getEndurance()).append(",")
                        .append(p.getAgility()).append("\n");
            }
        }
        return csv.toString();
    }

    public String generateTeamCsv(String coachId, String range) {
        TeamReportDto report = getTeamReport(coachId, range, null, null);
        StringBuilder csv = new StringBuilder();
        csv.append("AthleteX - Team Roster Performance Report\n");
        csv.append("Total Athletes,").append(report.getTeamSummary().getTotalAthletes()).append("\n");
        csv.append("Average Performance,").append(report.getTeamSummary().getAveragePerformance()).append("%\n");
        csv.append("Training Completion Rate,").append(report.getTeamSummary().getTrainingCompletionRate()).append("%\n");
        csv.append("Total Achievements,").append(report.getTeamSummary().getTotalAchievements()).append("\n\n");

        csv.append("Athlete Performance Rankings\n");
        csv.append("Rank,Athlete Name,Sport,Performance Score,Training Completion Rate,Achievements,Trend\n");
        if (report.getAthleteRankings() != null) {
            for (TopAthleteDto a : report.getAthleteRankings()) {
                csv.append(a.getRank()).append(",")
                        .append(escapeCsv(a.getName())).append(",")
                        .append(escapeCsv(a.getSport())).append(",")
                        .append(a.getPerformanceScore()).append("%,")
                        .append(a.getTrainingCompletionRate()).append("%,")
                        .append(a.getAchievementCount()).append(",")
                        .append(a.getTrend()).append("\n");
            }
        }
        return csv.toString();
    }

    public String generateTrainingCsv(String coachId, String range) {
        TrainingReportDto report = getTrainingReport(coachId, range, null, null);
        StringBuilder csv = new StringBuilder();
        csv.append("AthleteX - Training Report\n");
        csv.append("Total Sessions,").append(report.getTotalTrainings()).append("\n");
        csv.append("Completed Sessions,").append(report.getCompleted()).append("\n");
        csv.append("Scheduled Sessions,").append(report.getScheduled()).append("\n");
        csv.append("Cancelled Sessions,").append(report.getCancelled()).append("\n");
        csv.append("Completion Rate,").append(report.getCompletionRate()).append("%\n\n");

        csv.append("Athlete Training Breakdown\n");
        csv.append("Athlete Name,Sport,Total Sessions,Completed,Scheduled,Cancelled,Completion Rate\n");
        if (report.getAthleteTrainingStats() != null) {
            for (AthleteTrainingStatDto s : report.getAthleteTrainingStats()) {
                csv.append(escapeCsv(s.getAthleteName())).append(",")
                        .append(escapeCsv(s.getSport())).append(",")
                        .append(s.getTotalSessions()).append(",")
                        .append(s.getCompleted()).append(",")
                        .append(s.getScheduled()).append(",")
                        .append(s.getCancelled()).append(",")
                        .append(s.getCompletionRate()).append("%\n");
            }
        }
        return csv.toString();
    }

    public String generateAchievementCsv(String coachId, String range) {
        AchievementReportDto report = getAchievementReport(coachId, range, null, null);
        StringBuilder csv = new StringBuilder();
        csv.append("AthleteX - Achievement Report\n");
        csv.append("Total Achievements,").append(report.getTotalAchievements()).append("\n");
        csv.append("Championships,").append(report.getChampionships()).append("\n");
        csv.append("Medals,").append(report.getMedals()).append("\n");
        csv.append("Records,").append(report.getRecords()).append("\n");
        csv.append("Awards,").append(report.getAwards()).append("\n\n");

        csv.append("Achievements Timeline\n");
        csv.append("Athlete Name,Title,Category,Level,Date,Description\n");
        if (report.getTimeline() != null) {
            for (AchievementResponse a : report.getTimeline()) {
                csv.append(escapeCsv(a.getAthleteName())).append(",")
                        .append(escapeCsv(a.getTitle())).append(",")
                        .append(escapeCsv(a.getCategory())).append(",")
                        .append(escapeCsv(a.getLevel())).append(",")
                        .append(a.getDate() != null ? a.getDate().toString() : "").append(",")
                        .append(escapeCsv(a.getDescription())).append("\n");
            }
        }
        return csv.toString();
    }

    private User verifyCoach(String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }
        return coach;
    }

    private LocalDate resolveDateThreshold(String range, LocalDate startDate, LocalDate endDate) {
        if (startDate != null) return startDate;
        if (range == null || range.equalsIgnoreCase("all")) return null;
        return switch (range.toLowerCase()) {
            case "7d" -> LocalDate.now().minusDays(7);
            case "30d" -> LocalDate.now().minusDays(30);
            case "3m" -> LocalDate.now().minusMonths(3);
            case "1y" -> LocalDate.now().minusYears(1);
            default -> LocalDate.now().minusDays(30);
        };
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }
}
