package com.athletex.backend.service;

import com.athletex.backend.dto.BadgeResponse;
import com.athletex.backend.model.Achievement;
import com.athletex.backend.repository.AchievementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private AchievementRepository achievementRepository;

    @InjectMocks
    private BadgeService badgeService;

    private String athleteId;

    @BeforeEach
    void setUp() {
        athleteId = "athlete_999";
    }

    @Test
    @DisplayName("Should return all badges locked when athlete has no achievements")
    void evaluateAthleteBadges_NoAchievements() {
        when(achievementRepository.findByAthleteIdOrderByDateDesc(athleteId)).thenReturn(Collections.emptyList());
        when(achievementRepository.findByUserIdOrderByDateDesc(athleteId)).thenReturn(Collections.emptyList());

        List<BadgeResponse> badges = badgeService.evaluateAthleteBadges(athleteId);

        assertNotNull(badges);
        assertEquals(6, badges.size());

        // Verify all are locked
        assertTrue(badges.stream().noneMatch(BadgeResponse::getIsUnlocked));
    }

    @Test
    @DisplayName("Should unlock 'First Step Trophy' when athlete has 1 achievement")
    void evaluateAthleteBadges_OneAchievement() {
        Achievement achievement = Achievement.builder()
                .id("ach_1")
                .athleteId(athleteId)
                .title("100m Sprint")
                .level("Silver")
                .isVerified(false)
                .build();

        when(achievementRepository.findByAthleteIdOrderByDateDesc(athleteId)).thenReturn(List.of(achievement));

        List<BadgeResponse> badges = badgeService.evaluateAthleteBadges(athleteId);

        assertNotNull(badges);
        
        BadgeResponse firstStepBadge = badges.stream()
                .filter(b -> "badge_first_step".equals(b.getId()))
                .findFirst()
                .orElse(null);

        assertNotNull(firstStepBadge);
        assertTrue(firstStepBadge.getIsUnlocked());
        assertEquals(1, firstStepBadge.getProgress());
    }

    @Test
    @DisplayName("Should unlock 'Gold Standard' and 'Verified Champion' when matching criteria exist")
    void evaluateAthleteBadges_GoldAndVerified() {
        Achievement goldVerifiedAch = Achievement.builder()
                .id("ach_gold")
                .athleteId(athleteId)
                .title("National Gold Medal")
                .level("Gold")
                .isVerified(true)
                .proofUrl("https://proof.example.com/cert.pdf")
                .build();

        when(achievementRepository.findByAthleteIdOrderByDateDesc(athleteId)).thenReturn(List.of(goldVerifiedAch));

        List<BadgeResponse> badges = badgeService.evaluateAthleteBadges(athleteId);

        assertNotNull(badges);

        BadgeResponse goldBadge = badges.stream().filter(b -> "badge_gold_standard".equals(b.getId())).findFirst().orElse(null);
        BadgeResponse verifiedBadge = badges.stream().filter(b -> "badge_verified_champion".equals(b.getId())).findFirst().orElse(null);
        BadgeResponse proofBadge = badges.stream().filter(b -> "badge_evidence_master".equals(b.getId())).findFirst().orElse(null);

        assertNotNull(goldBadge);
        assertTrue(goldBadge.getIsUnlocked());

        assertNotNull(verifiedBadge);
        assertTrue(verifiedBadge.getIsUnlocked());

        assertNotNull(proofBadge);
        assertTrue(proofBadge.getIsUnlocked());
    }
}
