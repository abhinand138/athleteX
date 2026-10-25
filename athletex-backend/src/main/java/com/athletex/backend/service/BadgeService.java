package com.athletex.backend.service;

import com.athletex.backend.dto.BadgeResponse;
import com.athletex.backend.model.Achievement;
import com.athletex.backend.model.PerformanceDrill;
import com.athletex.backend.model.VerificationStatus;
import com.athletex.backend.repository.AchievementRepository;
import com.athletex.backend.repository.PerformanceDrillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final AchievementRepository achievementRepository;
    private final PerformanceDrillRepository drillRepository;

    public List<BadgeResponse> evaluateAthleteBadges(String athleteId) {
        List<Achievement> achievements = achievementRepository.findByAthleteIdOrderByDateDesc(athleteId);
        if (achievements == null || achievements.isEmpty()) {
            achievements = achievementRepository.findByUserIdOrderByDateDesc(athleteId);
        }

        List<PerformanceDrill> approvedDrills = (drillRepository != null)
                ? drillRepository.findByUserIdAndVerificationStatus(athleteId, VerificationStatus.APPROVED)
                : java.util.Collections.emptyList();

        int totalCount = achievements != null ? achievements.size() : 0;
        long verifiedCount = achievements != null ? achievements.stream().filter(a -> Boolean.TRUE.equals(a.getIsVerified())).count() : 0;
        boolean hasGold = achievements != null && achievements.stream().anyMatch(a -> a.getLevel() != null && a.getLevel().equalsIgnoreCase("Gold"));
        boolean hasNational = achievements != null && achievements.stream().anyMatch(a -> a.getLevel() != null && (
                a.getLevel().equalsIgnoreCase("National") || a.getLevel().equalsIgnoreCase("State")
        ));
        boolean hasSanction = achievements != null && achievements.stream().anyMatch(a -> a.getSanctionId() != null && !a.getSanctionId().isBlank());
        boolean hasProof = achievements != null && achievements.stream().anyMatch(a -> a.getProofUrl() != null && !a.getProofUrl().isBlank());

        // Combine Drill Benchmarks
        boolean hasSpeedPR = approvedDrills != null && approvedDrills.stream().anyMatch(d -> {
            String code = d.getDrillCode() != null ? d.getDrillCode().toUpperCase() : "";
            double val = d.getValue() != null ? d.getValue() : 999;
            return (code.contains("DASH") || code.contains("SPRINT") || code.contains("SPEED")) && val > 0 && val <= 4.80;
        });

        boolean hasStrengthPR = approvedDrills != null && approvedDrills.stream().anyMatch(d -> {
            String code = d.getDrillCode() != null ? d.getDrillCode().toUpperCase() : "";
            double val = d.getValue() != null ? d.getValue() : 0;
            return (code.contains("BENCH") || code.contains("SQUAT") || code.contains("DEADLIFT")) && val >= 100.0;
        });

        boolean hasAgilityPR = approvedDrills != null && approvedDrills.stream().anyMatch(d -> {
            String code = d.getDrillCode() != null ? d.getDrillCode().toUpperCase() : "";
            double val = d.getValue() != null ? d.getValue() : 999;
            return (code.contains("SHUTTLE") || code.contains("AGILITY") || code.contains("CONE")) && val > 0 && val <= 4.60;
        });

        boolean hasEndurancePR = approvedDrills != null && approvedDrills.stream().anyMatch(d -> {
            String code = d.getDrillCode() != null ? d.getDrillCode().toUpperCase() : "";
            double val = d.getValue() != null ? d.getValue() : 0;
            return (code.contains("YOYO") || code.contains("BEEP") || code.contains("ENDURANCE")) && val >= 18.0;
        });

        int totalApprovedDrills = approvedDrills != null ? approvedDrills.size() : 0;

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
                .description("Earned and logged a Gold Level tournament achievement")
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

        // 5. Verified Champion (Coach Endorsed)
        badges.add(BadgeResponse.builder()
                .id("badge_verified_champion")
                .title("Coach Verified Champion")
                .description("Received an official coach verification seal for an achievement")
                .icon("🛡️")
                .category("ENDORSEMENT")
                .isUnlocked(verifiedCount >= 1)
                .progress(Math.min((int) verifiedCount, 1))
                .target(1)
                .build());

        // 6. Evidence Master (Uploaded Media Proof)
        badges.add(BadgeResponse.builder()
                .id("badge_evidence_master")
                .title("Verified Media Proof")
                .description("Attached authenticated photo, certificate, or document proof")
                .icon("📸")
                .category("EXCELLENCE")
                .isUnlocked(hasProof)
                .progress(hasProof ? 1 : 0)
                .target(1)
                .build());

        // 7. Federation Sanctioned (State/National Sanction Code)
        badges.add(BadgeResponse.builder()
                .id("badge_federation_sanction")
                .title("Federation Sanctioned")
                .description("Registered an achievement backed by an official federation sanction/license code")
                .icon("🏛️")
                .category("ACCREDITATION")
                .isUnlocked(hasSanction || hasNational)
                .progress((hasSanction || hasNational) ? 1 : 0)
                .target(1)
                .build());

        // 8. Speed Demon (Combine Speed Benchmark)
        badges.add(BadgeResponse.builder()
                .id("badge_speed_demon")
                .title("Speed Demon")
                .description("Achieved an elite coach-certified sprint/dash combine record (<= 4.80s)")
                .icon("⚡")
                .category("COMBINE_ELITE")
                .isUnlocked(hasSpeedPR)
                .progress(hasSpeedPR ? 1 : 0)
                .target(1)
                .build());

        // 9. Century Club Power (Combine Strength Benchmark)
        badges.add(BadgeResponse.builder()
                .id("badge_century_power")
                .title("Century Club Power")
                .description("Recorded a verified 100kg+ 1RM squat, bench press, or deadlift combine PR")
                .icon("🏋️")
                .category("COMBINE_ELITE")
                .isUnlocked(hasStrengthPR)
                .progress(hasStrengthPR ? 1 : 0)
                .target(1)
                .build());

        // 10. Agility Prodigy (Combine Shuttle/Cone Benchmark)
        badges.add(BadgeResponse.builder()
                .id("badge_agility_prodigy")
                .title("Agility Prodigy")
                .description("Clocked an elite coach-certified shuttle or agility drill time (<= 4.60s)")
                .icon("🎯")
                .category("COMBINE_ELITE")
                .isUnlocked(hasAgilityPR)
                .progress(hasAgilityPR ? 1 : 0)
                .target(1)
                .build());

        // 11. Aerobic Engine Elite (Yo-Yo / Beep Test Benchmark)
        badges.add(BadgeResponse.builder()
                .id("badge_aerobic_engine")
                .title("Aerobic Engine Elite")
                .description("Conquered a Level 18.0+ Yo-Yo Intermittent or Beep Test endurance threshold")
                .icon("🫀")
                .category("COMBINE_ELITE")
                .isUnlocked(hasEndurancePR)
                .progress(hasEndurancePR ? 1 : 0)
                .target(1)
                .build());

        // 12. Combine Certified Master (3+ Certified Combine PRs)
        badges.add(BadgeResponse.builder()
                .id("badge_combine_master")
                .title("Combine Certified Master")
                .description("Secured 3 or more coach-audited and certified physical combine records")
                .icon("🎖️")
                .category("COMBINE_ELITE")
                .isUnlocked(totalApprovedDrills >= 3)
                .progress(Math.min(totalApprovedDrills, 3))
                .target(3)
                .build());

        return badges;
    }
}
