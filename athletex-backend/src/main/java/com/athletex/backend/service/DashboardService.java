package com.athletex.backend.service;

import com.athletex.backend.dto.ActivityItem;
import com.athletex.backend.dto.DashboardResponse;
import com.athletex.backend.dto.TrainingItem;
import com.athletex.backend.model.Performance;
import com.athletex.backend.model.Training;
import com.athletex.backend.model.TrainingStatus;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.AchievementRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.time.Duration;
import java.time.LocalDateTime;

import com.athletex.backend.repository.ActivityRepository;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PerformanceRepository performanceRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityRepository activityRepository;
    private final TrainingRepository trainingRepository;

    public DashboardResponse getDashboard(String userId) {

        // =============================
        // FIND USER
        // =============================
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // =============================
        // FIND PERFORMANCE
        // =============================
        Performance performance = performanceRepository
                .findByUserId(userId)
                .orElse(null);

        Integer performanceScore = 0;
        if (performance != null && performance.getOverallScore() != null) {
            performanceScore = (int) Math.round(performance.getOverallScore());
        }

        // =============================
        // ACHIEVEMENT COUNT
        // =============================
        long achievementCount = achievementRepository.countByUserId(userId);

        // =============================
        // REAL TRAINING SESSIONS COUNT & UPCOMING LIST
        // =============================
        long trainingSessionCount = trainingRepository.countByAthleteId(userId);

        List<Training> scheduledTrainings = trainingRepository.findByAthleteIdAndStatusOrderByDateAscTimeAsc(
                userId, TrainingStatus.SCHEDULED
        );

        List<TrainingItem> upcomingTrainingItems;
        if (scheduledTrainings != null && !scheduledTrainings.isEmpty()) {
            upcomingTrainingItems = scheduledTrainings.stream()
                    .map(t -> TrainingItem.builder()
                            .id(t.getId())
                            .title(t.getTitle())
                            .time(t.getTime() != null ? t.getTime() : "")
                            .category(t.getCategory() != null ? t.getCategory() : "General")
                            .date(t.getDate())
                            .status(t.getStatus())
                            .build())
                    .collect(Collectors.toList());
        } else {
            upcomingTrainingItems = Collections.emptyList();
        }

        // =============================
        // BUILD DASHBOARD RESPONSE
        // =============================
        return DashboardResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .sport(user.getSport())
                .position(user.getPosition())
                .age(user.getAge())
                .gender(user.getGender())
                .height(user.getHeight())
                .weight(user.getWeight())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .performance(performanceScore)
                .achievements((int) achievementCount)
                .scoutsViewed(0)
                .trainingSessions((int) trainingSessionCount)
                .recentActivities(
                        activityRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                                .limit(5)
                                .map(activity -> new ActivityItem(
                                        activity.getIcon(),
                                        activity.getTitle(),
                                        formatTimeAgo(activity.getTimestamp())
                                ))
                                .collect(Collectors.toList())
                )
                .upcomingTraining(upcomingTrainingItems)
                .build();
    }

    private String formatTimeAgo(LocalDateTime timestamp) {
        if (timestamp == null) return "Unknown";
        Duration duration = Duration.between(timestamp, LocalDateTime.now());
        if (duration.toMinutes() < 1) return "Just now";
        if (duration.toHours() < 1) return duration.toMinutes() + " minutes ago";
        if (duration.toDays() < 1) return duration.toHours() + " hours ago";
        if (duration.toDays() == 1) return "Yesterday";
        return duration.toDays() + " days ago";
    }
}