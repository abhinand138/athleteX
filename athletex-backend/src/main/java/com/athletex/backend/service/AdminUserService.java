package com.athletex.backend.service;

import com.athletex.backend.dto.*;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

// Admin UserService Governance Engine
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final TrainingRepository trainingRepository;
    private final AchievementRepository achievementRepository;
    private final AdminAuditLogService adminAuditLogService;

    public AdminStatsResponse getAdminStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalAthletes = allUsers.stream().filter(u -> u.getRole() == Role.ATHLETE).count();
        long totalCoaches = allUsers.stream().filter(u -> u.getRole() == Role.COACH).count();
        long totalAdmins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();
        long totalTrainings = trainingRepository.count();
        long totalAchievements = achievementRepository.count();
        long totalAssignments = assignmentRepository.findByStatus(AssignmentStatus.ACTIVE).size();

        // Get 5 most recent registered users
        List<UserAdminResponse> recentUsers = allUsers.stream()
                .sorted(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::mapToUserAdminResponse)
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalAthletes(totalAthletes)
                .totalCoaches(totalCoaches)
                .totalAdmins(totalAdmins)
                .totalTrainings(totalTrainings)
                .totalAchievements(totalAchievements)
                .totalAssignments(totalAssignments)
                .recentUsers(recentUsers)
                .build();
    }

    public List<UserAdminResponse> getAllUsers(String search, Role roleFilter) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> {
                    if (roleFilter != null && u.getRole() != roleFilter) {
                        return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
                        boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                        boolean matchSport = u.getSport() != null && u.getSport().toLowerCase().contains(q);
                        boolean matchPhone = u.getPhone() != null && u.getPhone().toLowerCase().contains(q);
                        return matchName || matchEmail || matchSport || matchPhone;
                    }
                    return true;
                })
                .map(this::mapToUserAdminResponse)
                .collect(Collectors.toList());
    }

    public UserAdminResponse updateUserRole(String userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        adminAuditLogService.logAction("USER_ROLE_UPDATED", "ADMIN_CONSOLE", "System Admin",
                saved.getId(), saved.getFullName(), "Updated user role from " + oldRole + " to " + newRole);

        return mapToUserAdminResponse(saved);
    }

    public UserAdminResponse updateUserDetails(String userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getSport() != null) {
            user.setSport(request.getSport().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User saved = userRepository.save(user);

        adminAuditLogService.logAction("USER_DETAILS_UPDATED", "ADMIN_CONSOLE", "System Admin",
                saved.getId(), saved.getFullName(), "Updated profile details for " + saved.getFullName() + " (" + saved.getEmail() + ")");

        return mapToUserAdminResponse(saved);
    }

    public List<AdminRosterResponse> getDetailedRosterAssignments() {
        List<CoachAthleteAssignment> assignments = assignmentRepository.findByStatus(AssignmentStatus.ACTIVE);
        if (assignments.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, User> userCache = new HashMap<>();

        return assignments.stream()
                .map(a -> {
                    User coach = userCache.computeIfAbsent(a.getCoachId(), id -> userRepository.findById(id).orElse(null));
                    User athlete = userCache.computeIfAbsent(a.getAthleteId(), id -> userRepository.findById(id).orElse(null));

                    return AdminRosterResponse.builder()
                            .assignmentId(a.getId())
                            .coachId(a.getCoachId())
                            .coachName(coach != null ? coach.getFullName() : "Coach " + a.getCoachId())
                            .coachEmail(coach != null ? coach.getEmail() : null)
                            .athleteId(a.getAthleteId())
                            .athleteName(athlete != null ? athlete.getFullName() : "Athlete " + a.getAthleteId())
                            .athleteEmail(athlete != null ? athlete.getEmail() : null)
                            .sport(athlete != null ? athlete.getSport() : (coach != null ? coach.getSport() : "General"))
                            .assignedAt(a.getAssignedAt() != null ? a.getAssignedAt() : LocalDateTime.now())
                            .status(a.getStatus() != null ? a.getStatus().name() : "ACTIVE")
                            .build();
                })
                .collect(Collectors.toList());
    }

    public AdminRosterResponse createRosterAssignment(AdminCreateAssignmentRequest request) {
        if (request.getCoachId() == null || request.getAthleteId() == null) {
            throw new RuntimeException("Coach ID and Athlete ID are required.");
        }

        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found with ID: " + request.getCoachId()));

        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new RuntimeException("Athlete not found with ID: " + request.getAthleteId()));

        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Selected user " + coach.getFullName() + " is not a Coach.");
        }
        if (athlete.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Selected user " + athlete.getFullName() + " is not an Athlete.");
        }

        // Deactivate existing active assignment for athlete if any
        Optional<CoachAthleteAssignment> existing = assignmentRepository.findByAthleteIdAndStatus(athlete.getId(), AssignmentStatus.ACTIVE);
        existing.ifPresent(a -> {
            a.setStatus(AssignmentStatus.INACTIVE);
            assignmentRepository.save(a);
        });

        // Create new assignment
        CoachAthleteAssignment newAssignment = CoachAthleteAssignment.builder()
                .coachId(coach.getId())
                .athleteId(athlete.getId())
                .assignedAt(LocalDateTime.now())
                .status(AssignmentStatus.ACTIVE)
                .build();

        CoachAthleteAssignment saved = assignmentRepository.save(newAssignment);

        adminAuditLogService.logAction("ROSTER_PAIRING_CREATED", "ADMIN_CONSOLE", "System Admin",
                saved.getId(), coach.getFullName() + " & " + athlete.getFullName(),
                "Created active roster pairing between Coach " + coach.getFullName() + " and Athlete " + athlete.getFullName());

        return AdminRosterResponse.builder()
                .assignmentId(saved.getId())
                .coachId(coach.getId())
                .coachName(coach.getFullName())
                .coachEmail(coach.getEmail())
                .athleteId(athlete.getId())
                .athleteName(athlete.getFullName())
                .athleteEmail(athlete.getEmail())
                .sport(athlete.getSport() != null ? athlete.getSport() : coach.getSport())
                .assignedAt(saved.getAssignedAt())
                .status(saved.getStatus().name())
                .build();
    }

    public String terminateRosterAssignment(String assignmentId) {
        CoachAthleteAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Roster assignment not found: " + assignmentId));

        assignmentRepository.delete(assignment);

        adminAuditLogService.logAction("ROSTER_PAIRING_TERMINATED", "ADMIN_CONSOLE", "System Admin",
                assignmentId, "Assignment " + assignmentId,
                "Terminated active roster assignment ID: " + assignmentId);

        return "Roster assignment terminated successfully.";
    }

    public List<CoachAthleteResponse> getAllRosterAssignments() {
        List<CoachAthleteAssignment> assignments = assignmentRepository.findByStatus(AssignmentStatus.ACTIVE);
        if (assignments.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, User> userCache = new HashMap<>();

        return assignments.stream()
                .map(a -> {
                    User coach = userCache.computeIfAbsent(a.getCoachId(), id -> userRepository.findById(id).orElse(null));
                    User athlete = userCache.computeIfAbsent(a.getAthleteId(), id -> userRepository.findById(id).orElse(null));

                    return CoachAthleteResponse.builder()
                            .id(athlete != null ? athlete.getId() : a.getAthleteId())
                            .fullName(athlete != null ? athlete.getFullName() : "Athlete")
                            .email(athlete != null ? athlete.getEmail() : null)
                            .phone(athlete != null ? athlete.getPhone() : null)
                            .sport(athlete != null ? athlete.getSport() : null)
                            .position(athlete != null ? athlete.getPosition() : null)
                            .city(athlete != null ? athlete.getCity() : null)
                            .bio(coach != null ? "Coach: " + coach.getFullName() : "Coach")
                            .build();
                })
                .collect(Collectors.toList());
    }

    public String deleteLastUser() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            return "No users found in database.";
        }

        User lastUser = users.get(users.size() - 1);
        String userId = lastUser.getId();
        String deletedInfo = lastUser.getFullName() + " (" + lastUser.getEmail() + ", Role: " + lastUser.getRole() + ")";

        // Clean up assignments
        List<CoachAthleteAssignment> coachAssignments = assignmentRepository.findByCoachIdAndStatus(userId, AssignmentStatus.ACTIVE);
        assignmentRepository.deleteAll(coachAssignments);

        Optional<CoachAthleteAssignment> athleteAssignment = assignmentRepository.findByAthleteIdAndStatus(userId, AssignmentStatus.ACTIVE);
        athleteAssignment.ifPresent(assignmentRepository::delete);

        // Delete User
        userRepository.deleteById(userId);

        adminAuditLogService.logAction("USER_DELETED", "ADMIN_CONSOLE", "System Admin",
                userId, lastUser.getFullName(),
                "Deleted last registered user account: " + deletedInfo);

        return "Successfully deleted last user: " + deletedInfo;
    }

    public String deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        String deletedInfo = user.getFullName() + " (" + user.getEmail() + ", Role: " + user.getRole() + ")";

        // Clean up assignments
        List<CoachAthleteAssignment> coachAssignments = assignmentRepository.findByCoachIdAndStatus(userId, AssignmentStatus.ACTIVE);
        assignmentRepository.deleteAll(coachAssignments);

        Optional<CoachAthleteAssignment> athleteAssignment = assignmentRepository.findByAthleteIdAndStatus(userId, AssignmentStatus.ACTIVE);
        athleteAssignment.ifPresent(assignmentRepository::delete);

        userRepository.deleteById(userId);

        adminAuditLogService.logAction("USER_DELETED", "ADMIN_CONSOLE", "System Admin",
                userId, user.getFullName(),
                "Deleted user account: " + deletedInfo);

        return "Successfully deleted user: " + deletedInfo;
    }

    public List<UserAdminResponse> getPendingCoaches() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.COACH && u.getVerificationStatus() == VerificationStatus.PENDING)
                .map(this::mapToUserAdminResponse)
                .collect(Collectors.toList());
    }

    public UserAdminResponse verifyCoach(String coachId, VerificationStatus status) {
        User user = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach user not found: " + coachId));

        if (user.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a Coach");
        }

        user.setVerificationStatus(status);
        User saved = userRepository.save(user);

        String actionStr = status == VerificationStatus.APPROVED ? "COACH_VERIFIED" : "COACH_REJECTED";
        adminAuditLogService.logAction(actionStr, "ADMIN_CONSOLE", "System Admin",
                saved.getId(), saved.getFullName(),
                (status == VerificationStatus.APPROVED ? "Approved credentials and verified" : "Rejected verification application for") + " coach " + saved.getFullName());

        return mapToUserAdminResponse(saved);
    }

    private UserAdminResponse mapToUserAdminResponse(User u) {
        long count = 0;
        if (u.getRole() == Role.COACH) {
            count = assignmentRepository.findByCoachIdAndStatus(u.getId(), AssignmentStatus.ACTIVE).size();
        } else if (u.getRole() == Role.ATHLETE) {
            count = assignmentRepository.findByAthleteIdAndStatus(u.getId(), AssignmentStatus.ACTIVE).isPresent() ? 1 : 0;
        }

        return UserAdminResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole())
                .sport(u.getSport())
                .city(u.getCity())
                .state(u.getState())
                .country(u.getCountry())
                .profileImage(u.getProfileImage())
                .activeAssignmentsCount(count)
                .verificationStatus(u.getVerificationStatus() != null ? u.getVerificationStatus() : VerificationStatus.APPROVED)
                .specialization(u.getSpecialization())
                .certifications(u.getCertifications())
                .experienceYears(u.getExperienceYears())
                .title(u.getTitle())
                .build();
    }
}
