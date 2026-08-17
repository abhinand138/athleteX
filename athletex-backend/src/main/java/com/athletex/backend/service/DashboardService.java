package com.athletex.backend.service;

import com.athletex.backend.dto.ActivityItem;
import com.athletex.backend.dto.DashboardResponse;
import com.athletex.backend.dto.TrainingItem;
import com.athletex.backend.model.Performance;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.AchievementRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.time.LocalDateTime;

import com.athletex.backend.model.Activity;
import com.athletex.backend.repository.ActivityRepository;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PerformanceRepository performanceRepository;
    private final AchievementRepository achievementRepository;
    private final ActivityRepository activityRepository;

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


        // =============================
        // PERFORMANCE SCORE
        // =============================

        Integer performanceScore = 0;

        if (performance != null &&
                performance.getOverallScore() != null) {

            performanceScore = (int) Math.round(
                    performance.getOverallScore()
            );
        }


        // =============================
        // ACHIEVEMENT COUNT
        // =============================

        long achievementCount =
                achievementRepository.countByUserId(userId);


        // =============================
        // BUILD DASHBOARD RESPONSE
        // =============================

        return DashboardResponse.builder()

                // =============================
                // USER INFORMATION
                // =============================

                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())


                // =============================
                // SPORTS INFORMATION
                // =============================

                .sport(user.getSport())
                .position(user.getPosition())


                // =============================
                // PERSONAL INFORMATION
                // =============================

                .age(user.getAge())
                .gender(user.getGender())


                // =============================
                // PHYSICAL INFORMATION
                // =============================

                .height(user.getHeight())
                .weight(user.getWeight())


                // =============================
                // LOCATION
                // =============================

                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())


                // =============================
                // PROFILE
                // =============================

                .bio(user.getBio())
                .profileImage(user.getProfileImage())


                // =============================
                // REAL PERFORMANCE
                // =============================

                .performance(performanceScore)


                // =============================
                // REAL ACHIEVEMENTS
                // =============================

                .achievements((int) achievementCount)


                // =============================
                // TEMPORARY STATISTICS
                // =============================

                .scoutsViewed(28)
                .trainingSessions(53)


                // =============================
                // RECENT ACTIVITY
                // =============================

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


                // =============================
                // UPCOMING TRAINING
                // =============================

                .upcomingTraining(List.of(

                        new TrainingItem(
                                "Sprint Practice",
                                "Today • 6:00 PM",
                                "Speed"
                        ),

                        new TrainingItem(
                                "Strength Training",
                                "Tomorrow • 8:00 AM",
                                "Power"
                        )
                ))


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