package com.athletex.backend.service;

import com.athletex.backend.dto.AchievementRequest;
import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.AchievementStatsResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.AchievementRepository;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final ActivityService activityService;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;

    // =============================
    // CREATE ACHIEVEMENT (DTO / COACH)
    // =============================
    public AchievementResponse createAchievement(AchievementRequest request) {
        String coachName = "Coach";
        String athleteName = "Athlete";
        User coachObj = null;
        User athleteObj = null;

        if (request.getCoachId() != null && !request.getCoachId().isBlank()) {
            User coach = userRepository.findById(request.getCoachId())
                    .orElseThrow(() -> new RuntimeException("Coach not found"));
            if (coach.getRole() != Role.COACH) {
                throw new RuntimeException("User is not a coach");
            }
            coachName = coach.getFullName();
            coachObj = coach;

            User athlete = userRepository.findById(request.getAthleteId())
                    .orElseThrow(() -> new RuntimeException("Athlete not found"));
            if (athlete.getRole() != Role.ATHLETE) {
                throw new RuntimeException("Target user is not an athlete");
            }
            athleteName = athlete.getFullName();
            athleteObj = athlete;

            boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                    request.getCoachId(), request.getAthleteId(), AssignmentStatus.ACTIVE
            );
            if (!isAssigned) {
                throw new SecurityException("Athlete is not assigned to this coach");
            }
        } else {
            athleteObj = userRepository.findById(request.getAthleteId()).orElse(null);
            athleteName = athleteObj != null ? athleteObj.getFullName() : "Athlete";
        }

        String icon = (request.getIcon() != null && !request.getIcon().isBlank()) ? request.getIcon() : "🏆";

        Achievement achievement = Achievement.builder()
                .athleteId(request.getAthleteId())
                .userId(request.getAthleteId())
                .coachId(request.getCoachId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .date(request.getDate())
                .icon(icon)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Achievement saved = achievementRepository.save(achievement);

        activityService.createActivity(
                request.getAthleteId(),
                "achievement_added",
                "Achievement Unlocked",
                achievement.getTitle(),
                icon
        );

        if (athleteObj != null) {
            try {
                notificationService.notifyAchievementUnlocked(saved, coachObj, athleteObj);
            } catch (Exception e) {
                // Non-blocking
            }
        }

        return mapToResponse(saved, coachName, athleteName);
    }

    // =============================
    // LEGACY CREATE ACHIEVEMENT
    // =============================
    public Achievement createAchievement(String userId, Achievement achievement) {
        achievement.setId(null);
        achievement.setAthleteId(userId);
        achievement.setUserId(userId);
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());

        if (achievement.getIcon() == null || achievement.getIcon().isBlank()) {
            achievement.setIcon("🏆");
        }

        Achievement savedAchievement = achievementRepository.save(achievement);

        activityService.createActivity(
                userId,
                "achievement_added",
                "Achievement Unlocked",
                achievement.getTitle(),
                achievement.getIcon()
        );

        return savedAchievement;
    }

    // =============================
    // GET ACHIEVEMENTS FOR ATHLETE
    // =============================
    public List<AchievementResponse> getAchievementsByAthlete(String athleteId) {
        List<Achievement> list = achievementRepository.findByAthleteIdOrderByDateDesc(athleteId);
        if (list == null || list.isEmpty()) {
            list = achievementRepository.findByUserIdOrderByDateDesc(athleteId);
        }

        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, String> userNames = new HashMap<>();
        return list.stream()
                .map(a -> {
                    String aId = a.getAthleteId() != null ? a.getAthleteId() : a.getUserId();
                    String athleteName = userNames.computeIfAbsent(aId, id ->
                            id != null ? userRepository.findById(id).map(User::getFullName).orElse("Athlete") : "Athlete");
                    String coachName = userNames.computeIfAbsent(a.getCoachId() != null ? a.getCoachId() : "", id ->
                            !id.isBlank() ? userRepository.findById(id).map(User::getFullName).orElse("Coach") : "Coach");
                    return mapToResponse(a, coachName, athleteName);
                })
                .collect(Collectors.toList());
    }

    // Legacy method
    public List<Achievement> getAchievements(String userId) {
        List<Achievement> list = achievementRepository.findByAthleteIdOrderByDateDesc(userId);
        if (list == null || list.isEmpty()) {
            return achievementRepository.findByUserIdOrderByDateDesc(userId);
        }
        return list;
    }

    // =============================
    // GET ACHIEVEMENTS FOR COACH
    // =============================
    public List<AchievementResponse> getAchievementsByCoach(String coachId) {
        List<Achievement> list = getRawAchievementsForCoach(coachId);
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, String> userNames = new HashMap<>();
        return list.stream()
                .map(a -> {
                    String aId = a.getAthleteId() != null ? a.getAthleteId() : a.getUserId();
                    String athleteName = userNames.computeIfAbsent(aId, id ->
                            id != null ? userRepository.findById(id).map(User::getFullName).orElse("Athlete") : "Athlete");
                    String coachName = userNames.computeIfAbsent(a.getCoachId() != null ? a.getCoachId() : "", id ->
                            !id.isBlank() ? userRepository.findById(id).map(User::getFullName).orElse("Coach") : "Coach");
                    return mapToResponse(a, coachName, athleteName);
                })
                .collect(Collectors.toList());
    }

    private List<Achievement> getRawAchievementsForCoach(String coachId) {
        List<CoachAthleteAssignment> assignments = assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        List<String> assignedAthleteIds = assignments.stream()
                .map(CoachAthleteAssignment::getAthleteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<String, Achievement> achievementMap = new LinkedHashMap<>();

        List<Achievement> byCoach = achievementRepository.findByCoachIdOrderByDateDesc(coachId);
        if (byCoach != null) {
            for (Achievement a : byCoach) {
                if (a.getId() != null) achievementMap.put(a.getId(), a);
            }
        }

        if (!assignedAthleteIds.isEmpty()) {
            List<Achievement> byAthletes = achievementRepository.findByAthleteIdInOrderByDateDesc(assignedAthleteIds);
            if (byAthletes != null) {
                for (Achievement a : byAthletes) {
                    if (a.getId() != null) achievementMap.put(a.getId(), a);
                }
            }

            List<Achievement> byUsers = achievementRepository.findByUserIdInOrderByDateDesc(assignedAthleteIds);
            if (byUsers != null) {
                for (Achievement a : byUsers) {
                    if (a.getId() != null) achievementMap.put(a.getId(), a);
                }
            }
        }

        List<Achievement> result = new ArrayList<>(achievementMap.values());
        result.sort((a, b) -> {
            if (a.getDate() == null && b.getDate() == null) return 0;
            if (a.getDate() == null) return 1;
            if (b.getDate() == null) return -1;
            return b.getDate().compareTo(a.getDate());
        });
        return result;
    }

    // =============================
    // GET ACHIEVEMENT BY ID
    // =============================
    public AchievementResponse getAchievementById(String id) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        String aId = achievement.getAthleteId() != null ? achievement.getAthleteId() : achievement.getUserId();
        String athleteName = aId != null ? userRepository.findById(aId).map(User::getFullName).orElse("Athlete") : "Athlete";
        String coachName = achievement.getCoachId() != null ? userRepository.findById(achievement.getCoachId()).map(User::getFullName).orElse("Coach") : "Coach";

        return mapToResponse(achievement, coachName, athleteName);
    }

    // =============================
    // UPDATE ACHIEVEMENT
    // =============================
    public AchievementResponse updateAchievement(String id, AchievementRequest request) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        if (request.getCoachId() != null && !request.getCoachId().isBlank()) {
            if (achievement.getCoachId() != null && !achievement.getCoachId().equals(request.getCoachId())) {
                boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                        request.getCoachId(), achievement.getAthleteId(), AssignmentStatus.ACTIVE
                );
                if (!isAssigned) {
                    throw new SecurityException("Unauthorized to edit this achievement");
                }
            }
        }

        achievement.setTitle(request.getTitle());
        achievement.setDescription(request.getDescription());
        achievement.setCategory(request.getCategory());
        achievement.setLevel(request.getLevel());
        achievement.setDate(request.getDate());
        if (request.getIcon() != null && !request.getIcon().isBlank()) {
            achievement.setIcon(request.getIcon());
        }
        achievement.setUpdatedAt(LocalDateTime.now());

        Achievement updated = achievementRepository.save(achievement);

        String aId = updated.getAthleteId() != null ? updated.getAthleteId() : updated.getUserId();
        String athleteName = aId != null ? userRepository.findById(aId).map(User::getFullName).orElse("Athlete") : "Athlete";
        String coachName = updated.getCoachId() != null ? userRepository.findById(updated.getCoachId()).map(User::getFullName).orElse("Coach") : "Coach";

        return mapToResponse(updated, coachName, athleteName);
    }

    // =============================
    // DELETE ACHIEVEMENT
    // =============================
    public void deleteAchievement(String id, String coachId) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        if (coachId != null && !coachId.isBlank()) {
            if (achievement.getCoachId() != null && !achievement.getCoachId().equals(coachId)) {
                boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                        coachId, achievement.getAthleteId(), AssignmentStatus.ACTIVE
                );
                if (!isAssigned) {
                    throw new SecurityException("Unauthorized to delete this achievement");
                }
            }
        }

        achievementRepository.deleteById(id);
    }

    // =============================
    // GET COACH ACHIEVEMENT STATS
    // =============================
    public AchievementStatsResponse getCoachAchievementStats(String coachId) {
        List<Achievement> list = getRawAchievementsForCoach(coachId);
        if (list == null || list.isEmpty()) {
            return AchievementStatsResponse.builder()
                    .totalAchievements(0)
                    .thisMonth(0)
                    .records(0)
                    .awards(0)
                    .build();
        }

        long total = list.size();
        YearMonth currentMonth = YearMonth.now();

        long thisMonth = list.stream()
                .filter(a -> a.getDate() != null && YearMonth.from(a.getDate()).equals(currentMonth))
                .count();

        long records = list.stream()
                .filter(a -> a.getCategory() != null && a.getCategory().equalsIgnoreCase("RECORD"))
                .count();

        long awards = list.stream()
                .filter(a -> a.getCategory() != null && (
                        a.getCategory().equalsIgnoreCase("AWARD") ||
                        a.getCategory().equalsIgnoreCase("CHAMPIONSHIP") ||
                        a.getCategory().equalsIgnoreCase("MEDAL")
                ))
                .count();

        return AchievementStatsResponse.builder()
                .totalAchievements(total)
                .thisMonth(thisMonth)
                .records(records)
                .awards(awards)
                .build();
    }

    // =============================
    // VERIFY / ENDORSE ACHIEVEMENT
    // =============================
    public AchievementResponse verifyAchievement(String achievementId, String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        String athleteId = achievement.getAthleteId() != null ? achievement.getAthleteId() : achievement.getUserId();
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                coachId, athleteId, AssignmentStatus.ACTIVE
        );
        if (!isAssigned) {
            throw new SecurityException("Unauthorized: Athlete is not assigned to this coach");
        }

        boolean currentVerified = Boolean.TRUE.equals(achievement.getIsVerified());
        achievement.setIsVerified(!currentVerified);
        if (!currentVerified) {
            achievement.setVerifiedByCoachId(coachId);
            achievement.setVerifiedByCoachName(coach.getFullName());
            achievement.setVerifiedAt(LocalDateTime.now());
        } else {
            achievement.setVerifiedByCoachId(null);
            achievement.setVerifiedByCoachName(null);
            achievement.setVerifiedAt(null);
        }
        achievement.setUpdatedAt(LocalDateTime.now());

        Achievement saved = achievementRepository.save(achievement);

        if (Boolean.TRUE.equals(saved.getIsVerified())) {
            activityService.createActivity(
                    athleteId,
                    "achievement_verified",
                    "Achievement Verified",
                    "Coach " + coach.getFullName() + " verified '" + saved.getTitle() + "'",
                    "✔"
            );
            try {
                notificationService.sendNotification(
                        athleteId,
                        "Achievement Verified! 🎉",
                        "Coach " + coach.getFullName() + " endorsed and verified your achievement: '" + saved.getTitle() + "'",
                        "VERIFICATION",
                        "/achievements"
                );
            } catch (Exception e) {
                // Non-blocking
            }
        }

        String athleteName = userRepository.findById(athleteId).map(User::getFullName).orElse("Athlete");
        return mapToResponse(saved, coach.getFullName(), athleteName);
    }

    // =============================
    // GET ACHIEVEMENT COUNT
    // =============================
    public long getAchievementCount(String userId) {
        long count = achievementRepository.countByAthleteId(userId);
        if (count == 0) {
            count = achievementRepository.countByUserId(userId);
        }
        return count;
    }

    private AchievementResponse mapToResponse(Achievement a, String coachName, String athleteName) {
        return AchievementResponse.builder()
                .id(a.getId())
                .athleteId(a.getAthleteId() != null ? a.getAthleteId() : a.getUserId())
                .athleteName(athleteName)
                .coachId(a.getCoachId())
                .coachName(coachName)
                .title(a.getTitle())
                .description(a.getDescription())
                .category(a.getCategory())
                .level(a.getLevel())
                .date(a.getDate())
                .icon(a.getIcon())
                .isVerified(a.getIsVerified() != null ? a.getIsVerified() : false)
                .verifiedByCoachId(a.getVerifiedByCoachId())
                .verifiedByCoachName(a.getVerifiedByCoachName())
                .verifiedAt(a.getVerifiedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}