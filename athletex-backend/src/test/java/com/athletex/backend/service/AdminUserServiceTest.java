package com.athletex.backend.service;

import com.athletex.backend.dto.*;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoachAthleteAssignmentRepository assignmentRepository;

    @Mock
    private TrainingRepository trainingRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private AdminAuditLogService adminAuditLogService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserService adminUserService;

    private User rootAdmin;
    private User secondAdmin;
    private User testAthlete;
    private User testCoach;

    @BeforeEach
    void setUp() {
        rootAdmin = User.builder()
                .id("admin_root")
                .fullName("System Administrator")
                .email("admin@athletex.com")
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        secondAdmin = User.builder()
                .id("admin_2")
                .fullName("Deputy Admin")
                .email("deputy@athletex.com")
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        testAthlete = User.builder()
                .id("athlete_1")
                .fullName("Michael Runner")
                .email("michael@example.com")
                .role(Role.ATHLETE)
                .accountStatus(AccountStatus.ACTIVE)
                .sport("Track & Field")
                .build();

        testCoach = User.builder()
                .id("coach_1")
                .fullName("Coach Sarah")
                .email("sarah@example.com")
                .role(Role.COACH)
                .accountStatus(AccountStatus.ACTIVE)
                .verificationStatus(VerificationStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should return platform statistics including suspended accounts")
    void getAdminStats_Success() {
        testAthlete.setAccountStatus(AccountStatus.SUSPENDED);
        List<User> users = List.of(rootAdmin, testAthlete, testCoach);

        when(userRepository.findAll()).thenReturn(users);
        when(trainingRepository.count()).thenReturn(15L);
        when(achievementRepository.count()).thenReturn(8L);
        when(assignmentRepository.findByStatus(AssignmentStatus.ACTIVE)).thenReturn(Collections.emptyList());

        AdminStatsResponse stats = adminUserService.getAdminStats();

        assertNotNull(stats);
        assertEquals(3, stats.getTotalUsers());
        assertEquals(1, stats.getTotalAthletes());
        assertEquals(1, stats.getTotalCoaches());
        assertEquals(1, stats.getTotalAdmins());
        assertEquals(1, stats.getTotalSuspended());
        assertEquals(15, stats.getTotalTrainings());
        assertEquals(8, stats.getTotalAchievements());
    }

    @Test
    @DisplayName("Should filter users by account status")
    void getAllUsers_FilterByStatus() {
        testAthlete.setAccountStatus(AccountStatus.SUSPENDED);
        when(userRepository.findAll()).thenReturn(List.of(rootAdmin, testAthlete, testCoach));

        List<UserAdminResponse> suspendedUsers = adminUserService.getAllUsers(null, null, AccountStatus.SUSPENDED);

        assertEquals(1, suspendedUsers.size());
        assertEquals("athlete_1", suspendedUsers.get(0).getId());
        assertEquals(AccountStatus.SUSPENDED, suspendedUsers.get(0).getAccountStatus());
    }

    @Test
    @DisplayName("Should update user role and record audit log")
    void updateUserRole_Success() {
        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(testAthlete));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAdminResponse response = adminUserService.updateUserRole("athlete_1", Role.COACH, "admin_root");

        assertNotNull(response);
        assertEquals(Role.COACH, response.getRole());
        verify(adminAuditLogService, times(1)).logAction(eq("USER_ROLE_UPDATED"), anyString(), anyString(), eq("athlete_1"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should prevent self-demotion of admin account")
    void updateUserRole_PreventSelfDemotion() {
        when(userRepository.findById("admin_root")).thenReturn(Optional.of(rootAdmin));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.updateUserRole("admin_root", Role.ATHLETE, "admin_root");
        });

        assertTrue(exception.getMessage().contains("Administrators cannot demote their own account"));
    }

    @Test
    @DisplayName("Should prevent altering root system administrator role")
    void updateUserRole_PreventRootAdminDemotion() {
        when(userRepository.findById("admin_root")).thenReturn(Optional.of(rootAdmin));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.updateUserRole("admin_root", Role.COACH, "admin_2");
        });

        assertTrue(exception.getMessage().contains("root system administrator account role cannot be altered"));
    }

    @Test
    @DisplayName("Should prevent demoting the last active administrator on the platform")
    void updateUserRole_PreventLastAdminDemotion() {
        when(userRepository.findById("admin_2")).thenReturn(Optional.of(secondAdmin));
        // Only one active admin remains in this mock
        when(userRepository.findAll()).thenReturn(List.of(secondAdmin, testAthlete));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.updateUserRole("admin_2", Role.ATHLETE, "admin_root");
        });

        assertTrue(exception.getMessage().contains("At least one active Administrator must remain"));
    }

    @Test
    @DisplayName("Should suspend user account and update suspension details")
    void updateUserStatus_Suspend_Success() {
        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(testAthlete));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAdminResponse response = adminUserService.updateUserStatus("athlete_1", AccountStatus.SUSPENDED, "Terms violation", "admin_root");

        assertNotNull(response);
        assertEquals(AccountStatus.SUSPENDED, response.getAccountStatus());
        assertEquals("Terms violation", response.getSuspensionReason());
        assertNotNull(response.getSuspendedAt());
        verify(adminAuditLogService, times(1)).logAction(eq("USER_SUSPENDED"), anyString(), anyString(), eq("athlete_1"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reactivate a suspended user account")
    void updateUserStatus_Reactivate_Success() {
        testAthlete.setAccountStatus(AccountStatus.SUSPENDED);
        testAthlete.setSuspensionReason("Old suspension");
        testAthlete.setSuspendedAt(LocalDateTime.now());

        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(testAthlete));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAdminResponse response = adminUserService.updateUserStatus("athlete_1", AccountStatus.ACTIVE, null, "admin_root");

        assertNotNull(response);
        assertEquals(AccountStatus.ACTIVE, response.getAccountStatus());
        assertNull(response.getSuspensionReason());
        assertNull(response.getSuspendedAt());
        verify(adminAuditLogService, times(1)).logAction(eq("USER_REACTIVATED"), anyString(), anyString(), eq("athlete_1"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should prevent self-suspension or self-ban by admin")
    void updateUserStatus_PreventSelfSuspension() {
        when(userRepository.findById("admin_2")).thenReturn(Optional.of(secondAdmin));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.updateUserStatus("admin_2", AccountStatus.SUSPENDED, "Test", "admin_2");
        });

        assertTrue(exception.getMessage().contains("Administrators cannot suspend or ban their own account"));
    }

    @Test
    @DisplayName("Should reset user password with generated temporary password")
    void resetUserPassword_GeneratedPassword_Success() {
        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(testAthlete));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedTempPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminResetPasswordResponse response = adminUserService.resetUserPassword("athlete_1", null, "admin_root");

        assertNotNull(response);
        assertNotNull(response.getTemporaryPassword());
        assertTrue(response.getTemporaryPassword().startsWith("AthleteX@"));
        assertEquals("athlete_1", response.getUserId());
        assertEquals("michael@example.com", response.getUserEmail());
        verify(adminAuditLogService, times(1)).logAction(eq("USER_PASSWORD_RESET"), anyString(), anyString(), eq("athlete_1"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reject custom reset password if it does not meet complexity requirements")
    void resetUserPassword_WeakPassword_ThrowsException() {
        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(testAthlete));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.resetUserPassword("athlete_1", "weakpass", "admin_root");
        });

        assertTrue(exception.getMessage().contains("complexity requirements"));
    }

    @Test
    @DisplayName("Should prevent admin from deleting their own account")
    void deleteUser_PreventSelfDeletion() {
        when(userRepository.findById("admin_root")).thenReturn(Optional.of(rootAdmin));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            adminUserService.deleteUser("admin_root", "admin_root");
        });

        assertTrue(exception.getMessage().contains("Administrators cannot delete their own account"));
    }
}
