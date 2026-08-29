package com.athletex.backend.service;

import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.PublicVerificationResponse;
import com.athletex.backend.model.Achievement;
import com.athletex.backend.model.PerformanceHistory;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.AchievementRepository;
import com.athletex.backend.repository.PerformanceHistoryRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicVerificationService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final PerformanceHistoryRepository performanceHistoryRepository;

    public PublicVerificationResponse getPublicVerification(String athleteId) {
        User user = userRepository.findById(athleteId).orElse(null);
        if (user == null) {
            return null;
        }

        // Fetch achievements
        List<Achievement> achievements = achievementRepository.findByAthleteIdOrderByDateDesc(athleteId);
        if (achievements.isEmpty()) {
            achievements = achievementRepository.findByUserIdInOrderByDateDesc(List.of(athleteId));
        }

        List<AchievementResponse> verifiedAchievements = achievements.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsVerified()))
                .map(a -> mapToAchievementResponse(a, user.getFullName()))
                .collect(Collectors.toList());

        // Fetch latest performance metrics
        List<PerformanceHistory> history = performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(athleteId);
        double speed = 0, strength = 0, endurance = 0, agility = 0, overall = 0;
        if (!history.isEmpty()) {
            PerformanceHistory latest = history.get(history.size() - 1);
            speed = latest.getSpeed() != null ? latest.getSpeed() : 0;
            strength = latest.getStrength() != null ? latest.getStrength() : 0;
            endurance = latest.getEndurance() != null ? latest.getEndurance() : 0;
            agility = latest.getAgility() != null ? latest.getAgility() : 0;
            overall = latest.getOverallScore() != null ? latest.getOverallScore() : (speed + strength + endurance + agility) / 4.0;
        }

        return PublicVerificationResponse.builder()
                .athleteId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .sport(user.getSport())
                .position(user.getPosition())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .bio(user.getBio())
                .age(user.getAge())
                .gender(user.getGender())
                .height(user.getHeight())
                .weight(user.getWeight())
                .overallScore(overall > 0 ? Math.round(overall * 10.0) / 10.0 : 85.0)
                .speed(speed > 0 ? speed : 85.0)
                .strength(strength > 0 ? strength : 80.0)
                .endurance(endurance > 0 ? endurance : 88.0)
                .agility(agility > 0 ? agility : 84.0)
                .verificationStatus("OFFICIALLY VERIFIED ATHLETE")
                .totalVerifiedAchievements(verifiedAchievements.size())
                .verifiedAchievements(verifiedAchievements)
                .build();
    }

    private AchievementResponse mapToAchievementResponse(Achievement a, String athleteName) {
        return AchievementResponse.builder()
                .id(a.getId())
                .athleteId(a.getAthleteId() != null ? a.getAthleteId() : a.getUserId())
                .athleteName(athleteName)
                .title(a.getTitle())
                .category(a.getCategory())
                .description(a.getDescription())
                .date(a.getDate())
                .isVerified(Boolean.TRUE.equals(a.getIsVerified()))
                .verifiedByCoachId(a.getVerifiedByCoachId())
                .verifiedByCoachName(a.getVerifiedByCoachName())
                .verifiedAt(a.getVerifiedAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
