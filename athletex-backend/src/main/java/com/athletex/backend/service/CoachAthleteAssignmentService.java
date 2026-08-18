package com.athletex.backend.service;

import com.athletex.backend.dto.AthleteCardResponse;
import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachAthleteAssignmentService {

    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    // ===========================
    // ASSIGN ATHLETE TO COACH
    // ===========================
    public CoachAthleteAssignment assignAthlete(String coachId, String athleteId) {
        // Verify coach exists and has COACH role
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        // Verify athlete exists and has ATHLETE role
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        if (athlete.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Target user is not an athlete");
        }

        // Prevent duplicate ACTIVE assignments
        if (assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, AssignmentStatus.ACTIVE)) {
            throw new RuntimeException("Athlete is already assigned to this coach");
        }

        CoachAthleteAssignment assignment = CoachAthleteAssignment.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .assignedAt(LocalDateTime.now())
                .status(AssignmentStatus.ACTIVE)
                .build();

        return assignmentRepository.save(assignment);
    }

    // ===========================
    // GET ATHLETES FOR COACH
    // ===========================
    public List<AthleteCardResponse> getAthletesForCoach(String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        List<CoachAthleteAssignment> assignments =
                assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);

        if (assignments == null) {
            return Collections.emptyList();
        }

        return assignments.stream()
                .map(a -> {
                    if (a == null || a.getAthleteId() == null) return null;
                    Optional<User> athleteOpt = userRepository.findById(a.getAthleteId());
                    if (athleteOpt.isEmpty()) return null;
                    User athlete = athleteOpt.get();
                    return AthleteCardResponse.builder()
                            .id(athlete.getId())
                            .fullName(athlete.getFullName() != null ? athlete.getFullName() : "")
                            .email(athlete.getEmail() != null ? athlete.getEmail() : "")
                            .phone(athlete.getPhone() != null ? athlete.getPhone() : "")
                            .sport(athlete.getSport() != null ? athlete.getSport() : "")
                            .position(athlete.getPosition() != null ? athlete.getPosition() : "")
                            .age(athlete.getAge())
                            .gender(athlete.getGender() != null ? athlete.getGender() : "")
                            .height(athlete.getHeight())
                            .weight(athlete.getWeight())
                            .city(athlete.getCity() != null ? athlete.getCity() : "")
                            .state(athlete.getState() != null ? athlete.getState() : "")
                            .country(athlete.getCountry() != null ? athlete.getCountry() : "")
                            .bio(athlete.getBio() != null ? athlete.getBio() : "")
                            .profileImage(athlete.getProfileImage() != null ? athlete.getProfileImage() : "")
                            .assignmentId(a.getId())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ===========================
    // GET COACH FOR ATHLETE
    // ===========================
    public Optional<CoachAthleteAssignment> getCoachForAthlete(String athleteId) {
        return assignmentRepository.findByAthleteIdAndStatus(athleteId, AssignmentStatus.ACTIVE);
    }

    // ===========================
    // UNASSIGN ATHLETE
    // ===========================
    public void unassignAthlete(String coachId, String athleteId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        List<CoachAthleteAssignment> assignments =
                assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);

        if (assignments == null) {
            throw new RuntimeException("Assignment not found");
        }

        CoachAthleteAssignment assignment = assignments.stream()
                .filter(a -> a != null && athleteId.equals(a.getAthleteId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setStatus(AssignmentStatus.INACTIVE);
        assignmentRepository.save(assignment);
    }

    // ===========================
    // COUNT ATHLETES FOR COACH
    // ===========================
    public long countAthletesForCoach(String coachId) {
        return assignmentRepository.countByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
    }

    // ===========================
    // GET AVAILABLE ATHLETES FOR ASSIGNMENT
    // ===========================
    public List<AthleteCardResponse> getAvailableAthletes(String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        List<CoachAthleteAssignment> activeAssignments =
                assignmentRepository.findByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        
        Set<String> assignedAthleteIds = new HashSet<>();
        if (activeAssignments != null) {
            for (CoachAthleteAssignment a : activeAssignments) {
                if (a != null && a.getAthleteId() != null) {
                    assignedAthleteIds.add(a.getAthleteId());
                }
            }
        }

        List<User> allUsers = userRepository.findAll();
        List<User> athletes = allUsers.stream()
                .filter(u -> u != null && u.getRole() == Role.ATHLETE)
                .filter(u -> u.getId() != null && !assignedAthleteIds.contains(u.getId()))
                .collect(Collectors.toList());

        return athletes.stream()
                .map(athlete -> AthleteCardResponse.builder()
                        .id(athlete.getId())
                        .fullName(athlete.getFullName() != null ? athlete.getFullName() : "")
                        .email(athlete.getEmail() != null ? athlete.getEmail() : "")
                        .phone(athlete.getPhone() != null ? athlete.getPhone() : "")
                        .sport(athlete.getSport() != null ? athlete.getSport() : "")
                        .position(athlete.getPosition() != null ? athlete.getPosition() : "")
                        .age(athlete.getAge())
                        .gender(athlete.getGender() != null ? athlete.getGender() : "")
                        .height(athlete.getHeight())
                        .weight(athlete.getWeight())
                        .city(athlete.getCity() != null ? athlete.getCity() : "")
                        .state(athlete.getState() != null ? athlete.getState() : "")
                        .country(athlete.getCountry() != null ? athlete.getCountry() : "")
                        .bio(athlete.getBio() != null ? athlete.getBio() : "")
                        .profileImage(athlete.getProfileImage() != null ? athlete.getProfileImage() : "")
                        .build())
                .collect(Collectors.toList());
    }
}
