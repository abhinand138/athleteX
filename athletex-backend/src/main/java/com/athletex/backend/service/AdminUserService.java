package com.athletex.backend.service;

import com.athletex.backend.dto.AdminStatsResponse;
import com.athletex.backend.dto.CoachAthleteResponse;
import com.athletex.backend.dto.UserAdminResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public AdminStatsResponse getAdminStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalAthletes = allUsers.stream().filter(u -> u.getRole() == Role.ATHLETE).count();
        long totalCoaches = allUsers.stream().filter(u -> u.getRole() == Role.COACH).count();
        long totalAdmins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();
        long totalTrainings = trainingRepository.count();
        long totalAchievements = achievementRepository.count();
        long totalAssignments = assignmentRepository.findByStatus(AssignmentStatus.ACTIVE).size();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalAthletes(totalAthletes)
                .totalCoaches(totalCoaches)
                .totalAdmins(totalAdmins)
                .totalTrainings(totalTrainings)
                .totalAchievements(totalAchievements)
                .totalAssignments(totalAssignments)
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
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(newRole);
        User saved = userRepository.save(user);
        return mapToUserAdminResponse(saved);
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
                .build();
    }
}
