package com.athletex.backend.service;

import com.athletex.backend.dto.BadgeResponse;
import com.athletex.backend.model.Achievement;
import com.athletex.backend.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final AchievementRepository achievementRepository;

    public List<BadgeResponse> evaluateAthleteBadges(String athleteId) {
        List<Achievement> achievements = achievementRepository.findByAthleteIdOrderByDateDesc(athleteId);
        if (achievements == null || achievements.isEmpty()) {
            achievements = achievementRepository.findByUserIdOrderByDateDesc(athleteId);
        }

        int totalCount = achievements != null ? achievements.size() : 0;
        boolean hasGold = achievements != null && achievements.stream().anyMatch(a -> a.getLevel() != null && a.getLevel().equalsIgnoreCase("Gold"));
        boolean hasVerified = achievements != null && achievements.stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsVerified()));
        boolean hasProof = achievements != null && achievements.stream().anyMatch(a -> a.getProofUrl() != null && !a.getProofUrl().isBlank());

        List<BadgeResponse> badges = new ArrayList<>();

        // 1. First Step (1 Achievement Logged)
        badges.add(BadgeResponse.builder()
                .id("badge_first_step")
                .title("First Step Trophy")
                .description("Logged your very first athletic achievement on AthleteX")
                .icon("🏆")
                .category("MILESTONE")
                .isUnlocked(totalCount >= 1)
                .progress(Math.min(totalCount, 1))
                .target(1)
                .build());

        // 2. Gold Standard (1 Gold Medal/Level)
        badges.add(BadgeResponse.builder()
                .id("badge_gold_standard")
                .title("Gold Standard")
                .description("Earned and logged a Gold Level achievement")
                .icon("🥇")
                .category("EXCELLENCE")
                .isUnlocked(hasGold)
                .progress(hasGold ? 1 : 0)
                .target(1)
                .build());

        // 3. Triple Crown (3 Achievements Logged)
        badges.add(BadgeResponse.builder()
                .id("badge_triple_crown")
                .title("Triple Crown")
                .description("Accumulated 3 or more logged achievements in your cabinet")
                .icon("⚡")
                .category("MILESTONE")
                .isUnlocked(totalCount >= 3)
                .progress(Math.min(totalCount, 3))
                .target(3)
                .build());

        // 4. Elite Competitor (5 Achievements Logged)
        badges.add(BadgeResponse.builder()
                .id("badge_elite_competitor")
                .title("Elite Competitor")
                .description("Reached a milestone of 5 logged achievements")
                .icon("🌟")
                .category("MILESTONE")
                .isUnlocked(totalCount >= 5)
                .progress(Math.min(totalCount, 5))
                .target(5)
                .build());

        // 5. Verified Champion (1 Coach Verified Seal)
        badges.add(BadgeResponse.builder()
                .id("badge_verified_champion")
                .title("Coach Verified Champion")
                .description("Received an official coach verification seal for an achievement")
                .icon("🛡️")
                .category("ENDORSEMENT")
                .isUnlocked(hasVerified)
                .progress(hasVerified ? 1 : 0)
                .target(1)
                .build());

        // 6. Evidence Master (Uploaded Proof / Certificate Link)
        badges.add(BadgeResponse.builder()
                .id("badge_evidence_master")
                .title("Verified Media Proof")
                .description("Attached evidence or certificate proof to an achievement")
                .icon("📸")
                .category("EXCELLENCE")
                .isUnlocked(hasProof)
                .progress(hasProof ? 1 : 0)
                .target(1)
                .build());

        return badges;
    }
}
