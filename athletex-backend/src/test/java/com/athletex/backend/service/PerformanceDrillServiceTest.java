package com.athletex.backend.service;

import com.athletex.backend.dto.drill.CombineSummaryResponse;
import com.athletex.backend.dto.drill.LogDrillRequest;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.PerformanceDrillRepository;
import com.athletex.backend.repository.PerformanceRepository;
import com.athletex.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PerformanceDrillServiceTest {

    @Mock
    private PerformanceDrillRepository drillRepository;

    @Mock
    private PerformanceRepository performanceRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoachAthleteAssignmentRepository assignmentRepository;

    @Mock
    private PerformanceService performanceService;

    @InjectMocks
    private PerformanceDrillService drillService;

    private final String userId = "athlete123";

    @Test
    @DisplayName("First drill attempt should automatically be marked as Personal Record")
    void logDrill_firstAttempt_shouldBePr() {
        LogDrillRequest request = LogDrillRequest.builder()
                .drillCode("40_YARD_DASH")
                .drillName("40-Yard Dash")
                .category("SPEED")
                .value(4.55)
                .unit("s")
                .lowerIsBetter(true)
                .build();

        when(drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, "40_YARD_DASH"))
                .thenReturn(new ArrayList<>());
        when(drillRepository.save(any(PerformanceDrill.class))).thenAnswer(i -> {
            PerformanceDrill d = i.getArgument(0);
            d.setId("drill-1");
            return d;
        });

        PerformanceDrill result = drillService.logDrill(userId, request);

        assertNotNull(result);
        assertTrue(result.getIsPersonalRecord());
        assertEquals(4.55, result.getValue());
        verify(activityService).createActivity(eq(userId), eq("personal_record"), anyString(), anyString(), eq("🏆"));
        verify(notificationService).sendNotification(eq(userId), anyString(), anyString(), eq("ACHIEVEMENT"), anyString());
    }

    @Test
    @DisplayName("Faster sprint (lower is better) should beat previous best and update old PR flag")
    void logDrill_fasterSprint_shouldBecomeNewPr() {
        PerformanceDrill oldPr = PerformanceDrill.builder()
                .id("old-pr-1")
                .userId(userId)
                .drillCode("40_YARD_DASH")
                .value(4.60)
                .isPersonalRecord(true)
                .lowerIsBetter(true)
                .build();

        LogDrillRequest request = LogDrillRequest.builder()
                .drillCode("40_YARD_DASH")
                .drillName("40-Yard Dash")
                .category("SPEED")
                .value(4.42) // faster!
                .unit("s")
                .lowerIsBetter(true)
                .build();

        when(drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, "40_YARD_DASH"))
                .thenReturn(new ArrayList<>(List.of(oldPr)));
        when(drillRepository.save(any(PerformanceDrill.class))).thenAnswer(i -> i.getArgument(0));

        PerformanceDrill result = drillService.logDrill(userId, request);

        assertTrue(result.getIsPersonalRecord());
        assertEquals(4.42, result.getValue());
        assertFalse(oldPr.getIsPersonalRecord(), "Previous PR should have isPersonalRecord set to false");
        verify(drillRepository).save(oldPr);
    }

    @Test
    @DisplayName("Slower sprint should NOT be marked as Personal Record")
    void logDrill_slowerSprint_shouldNotBePr() {
        PerformanceDrill currentPr = PerformanceDrill.builder()
                .id("pr-1")
                .userId(userId)
                .drillCode("40_YARD_DASH")
                .value(4.40)
                .isPersonalRecord(true)
                .lowerIsBetter(true)
                .build();

        LogDrillRequest request = LogDrillRequest.builder()
                .drillCode("40_YARD_DASH")
                .drillName("40-Yard Dash")
                .category("SPEED")
                .value(4.58) // slower than 4.40
                .unit("s")
                .lowerIsBetter(true)
                .build();

        when(drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, "40_YARD_DASH"))
                .thenReturn(new ArrayList<>(List.of(currentPr)));
        when(drillRepository.save(any(PerformanceDrill.class))).thenAnswer(i -> i.getArgument(0));

        PerformanceDrill result = drillService.logDrill(userId, request);

        assertFalse(result.getIsPersonalRecord());
        assertEquals(4.58, result.getValue());
        verify(activityService).createActivity(eq(userId), eq("drill_attempt"), anyString(), anyString(), eq("⏱️"));
    }

    @Test
    @DisplayName("Higher vertical jump (higher is better) should become new Personal Record")
    void logDrill_higherJump_shouldBePr() {
        PerformanceDrill oldPr = PerformanceDrill.builder()
                .id("old-jump-1")
                .userId(userId)
                .drillCode("VERTICAL_JUMP")
                .value(30.0)
                .isPersonalRecord(true)
                .lowerIsBetter(false)
                .build();

        LogDrillRequest request = LogDrillRequest.builder()
                .drillCode("VERTICAL_JUMP")
                .drillName("Vertical Jump")
                .category("STRENGTH")
                .value(34.5) // higher!
                .unit("in")
                .lowerIsBetter(false)
                .build();

        when(drillRepository.findByUserIdAndDrillCodeOrderByRecordedAtDesc(userId, "VERTICAL_JUMP"))
                .thenReturn(new ArrayList<>(List.of(oldPr)));
        when(drillRepository.save(any(PerformanceDrill.class))).thenAnswer(i -> i.getArgument(0));

        PerformanceDrill result = drillService.logDrill(userId, request);

        assertTrue(result.getIsPersonalRecord());
        assertEquals(34.5, result.getValue());
    }

    @Test
    @DisplayName("Combine summary correctly computes PRs and benchmark scores")
    void getCombineSummary_shouldAggregateCorrectly() {
        PerformanceDrill dashAttempt1 = PerformanceDrill.builder()
                .drillCode("40_YARD_DASH")
                .drillName("40-Yard Dash")
                .category("SPEED")
                .value(4.45)
                .unit("s")
                .lowerIsBetter(true)
                .percentile(94.0)
                .recordedAt(LocalDateTime.now())
                .build();

        PerformanceDrill jumpAttempt1 = PerformanceDrill.builder()
                .drillCode("VERTICAL_JUMP")
                .drillName("Vertical Jump")
                .category("STRENGTH")
                .value(35.0)
                .unit("in")
                .lowerIsBetter(false)
                .percentile(92.0)
                .recordedAt(LocalDateTime.now())
                .build();

        when(drillRepository.findByUserIdOrderByRecordedAtDesc(userId))
                .thenReturn(List.of(dashAttempt1, jumpAttempt1));

        CombineSummaryResponse response = drillService.getCombineSummary(userId);

        assertNotNull(response);
        assertEquals(2, response.getTotalAttempts());
        assertEquals(2, response.getPersonalRecordsCount());
        assertTrue(response.getBenchmarkScores().get("speed") >= 90.0);
        assertTrue(response.getBenchmarkScores().get("strength") >= 90.0);
    }
}
