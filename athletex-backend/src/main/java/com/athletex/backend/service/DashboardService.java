package com.athletex.backend.service;

import com.athletex.backend.dto.ActivityItem;
import com.athletex.backend.dto.DashboardResponse;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.athletex.backend.dto.TrainingItem;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;

    public DashboardResponse getDashboard(String userId) {

        // Find user from MongoDB
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build dashboard response
        return DashboardResponse.builder()

                // Basic user information
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())

                // Sports information
                .sport(user.getSport())
                .position(user.getPosition())

                // Personal information
                .age(user.getAge())
                .gender(user.getGender())

                // Physical information
                .height(user.getHeight())
                .weight(user.getWeight())

                // Location
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())

                // Profile
                .bio(user.getBio())
                .profileImage(user.getProfileImage())

                // Temporary dashboard statistics
                .performance(92)
                .achievements(14)
                .scoutsViewed(28)
                .trainingSessions(53)

                // Recent activities
                .recentActivities(List.of(
                        new ActivityItem(
                                "🏃",
                                "Performance updated",
                                "2 hours ago"
                        ),
                        new ActivityItem(
                                "🏅",
                                "Achievement unlocked",
                                "Yesterday"
                        ),
                        new ActivityItem(
                                "👨‍🏫",
                                "Coach reviewed your profile",
                                "2 days ago"
                        )
                ))

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
}