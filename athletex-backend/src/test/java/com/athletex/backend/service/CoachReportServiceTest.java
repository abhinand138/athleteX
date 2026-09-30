package com.athletex.backend.service;

import com.athletex.backend.dto.reports.IndividualAthleteReportDto;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoachReportServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoachAthleteAssignmentRepository assignmentRepository;

    @Mock
    private PerformanceRepository performanceRepository;

    @Mock
    private PerformanceHistoryRepository performanceHistoryRepository;

    @Mock
    private TrainingRepository trainingRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private CoachAnalyticsService coachAnalyticsService;

    @Mock
    private AchievementService achievementService;

    @InjectMocks
    private CoachReportService coachReportService;

    private String coachId;
    private String athleteId;
    private User coachUser;
    private User athleteUser;

    @BeforeEach
    void setUp() {
        coachId = "coach_001";
        athleteId = "athlete_001";

        coachUser = User.builder()
                .id(coachId)
                .fullName("Coach Alex")
                .role(Role.COACH)
                .build();

        athleteUser = User.builder()
                .id(athleteId)
                .fullName("Runner Sarah")
                .role(Role.ATHLETE)
                .build();
    }

    @Test
    @DisplayName("Should generate Individual Athlete Report when valid coach and athlete are assigned")
    void getIndividualAthleteReport_Success() {
        when(userRepository.findById(coachId)).thenReturn(Optional.of(coachUser));
        when(userRepository.findById(athleteId)).thenReturn(Optional.of(athleteUser));
        when(assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, AssignmentStatus.ACTIVE)).thenReturn(true);

        Performance perf = Performance.builder()
                .userId(athleteId)
                .overallScore(85.5)
                .speed(90.0)
                .strength(80.0)
                .endurance(88.0)
                .agility(84.0)
                .build();

        when(performanceRepository.findByUserId(athleteId)).thenReturn(Optional.of(perf));
        when(performanceHistoryRepository.findByUserIdOrderByRecordedAtAsc(athleteId)).thenReturn(Collections.emptyList());
        when(trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(athleteId)).thenReturn(Collections.emptyList());
        when(achievementService.getAchievementsByAthlete(athleteId)).thenReturn(Collections.emptyList());
        when(activityRepository.findByUserIdOrderByTimestampDesc(athleteId)).thenReturn(Collections.emptyList());

        IndividualAthleteReportDto report = coachReportService.getIndividualAthleteReport(coachId, athleteId, "ALL", null, null);

        assertNotNull(report);
        assertEquals(athleteId, report.getAthleteId());
        assertEquals("Runner Sarah", report.getAthleteName());
        assertEquals(85.5, report.getOverallScore());
        assertEquals(90.0, report.getSpeed());
    }

    @Test
    @DisplayName("Should throw SecurityException when coach is not assigned to athlete")
    void getIndividualAthleteReport_UnassignedAccessDenied() {
        when(userRepository.findById(coachId)).thenReturn(Optional.of(coachUser));
        when(userRepository.findById(athleteId)).thenReturn(Optional.of(athleteUser));
        when(assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, AssignmentStatus.ACTIVE)).thenReturn(false);

        SecurityException exception = assertThrows(SecurityException.class, () -> {
            coachReportService.getIndividualAthleteReport(coachId, athleteId, "ALL", null, null);
        });

        assertTrue(exception.getMessage().contains("Access Denied"));
    }
}
