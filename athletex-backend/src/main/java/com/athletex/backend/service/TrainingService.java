package com.athletex.backend.service;

import com.athletex.backend.dto.TrainingRequest;
import com.athletex.backend.dto.TrainingResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;

    // ===========================
    // CREATE TRAINING
    // ===========================
    public TrainingResponse createTraining(TrainingRequest request) {
        // 1. Verify Coach
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        // 2. Verify Athlete
        User athlete = userRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        if (athlete.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Target user is not an athlete");
        }

        // 3. Verify Active Assignment
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                request.getCoachId(), request.getAthleteId(), AssignmentStatus.ACTIVE
        );
        if (!isAssigned) {
            throw new SecurityException("Athlete is not assigned to this coach");
        }

        Training training = Training.builder()
                .coachId(request.getCoachId())
                .athleteId(request.getAthleteId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .date(request.getDate())
                .time(request.getTime())
                .status(TrainingStatus.SCHEDULED)
                .createdAt(LocalDateTime.now())
                .build();

        Training saved = trainingRepository.save(training);
        return mapToResponse(saved, coach.getFullName(), athlete.getFullName());
    }

    // ===========================
    // GET COACH TRAININGS
    // ===========================
    public List<TrainingResponse> getCoachTraining(String coachId) {
        List<Training> trainings = trainingRepository.findByCoachIdOrderByDateDescTimeDesc(coachId);
        if (trainings == null || trainings.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, String> userNames = new HashMap<>();
        return trainings.stream()
                .map(t -> {
                    String athleteName = userNames.computeIfAbsent(t.getAthleteId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Athlete"));
                    String coachName = userNames.computeIfAbsent(t.getCoachId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Coach"));
                    return mapToResponse(t, coachName, athleteName);
                })
                .collect(Collectors.toList());
    }

    // ===========================
    // GET ATHLETE TRAININGS
    // ===========================
    public List<TrainingResponse> getAthleteTraining(String athleteId) {
        List<Training> trainings = trainingRepository.findByAthleteIdOrderByDateDescTimeDesc(athleteId);
        if (trainings == null || trainings.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, String> userNames = new HashMap<>();
        return trainings.stream()
                .map(t -> {
                    String athleteName = userNames.computeIfAbsent(t.getAthleteId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Athlete"));
                    String coachName = userNames.computeIfAbsent(t.getCoachId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Coach"));
                    return mapToResponse(t, coachName, athleteName);
                })
                .collect(Collectors.toList());
    }

    // ===========================
    // GET ATHLETE UPCOMING TRAININGS
    // ===========================
    public List<TrainingResponse> getAthleteUpcomingTraining(String athleteId) {
        List<Training> trainings = trainingRepository.findByAthleteIdAndStatusOrderByDateAscTimeAsc(
                athleteId, TrainingStatus.SCHEDULED
        );
        if (trainings == null || trainings.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, String> userNames = new HashMap<>();
        return trainings.stream()
                .map(t -> {
                    String athleteName = userNames.computeIfAbsent(t.getAthleteId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Athlete"));
                    String coachName = userNames.computeIfAbsent(t.getCoachId(), id ->
                            userRepository.findById(id).map(User::getFullName).orElse("Unknown Coach"));
                    return mapToResponse(t, coachName, athleteName);
                })
                .collect(Collectors.toList());
    }

    // ===========================
    // UPDATE TRAINING
    // ===========================
    public TrainingResponse updateTraining(String trainingId, TrainingRequest request) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training session not found"));

        if (!training.getCoachId().equals(request.getCoachId())) {
            throw new SecurityException("Unauthorized to edit this training session");
        }

        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        training.setCategory(request.getCategory());
        training.setDate(request.getDate());
        training.setTime(request.getTime());

        Training updated = trainingRepository.save(training);
        String coachName = userRepository.findById(training.getCoachId()).map(User::getFullName).orElse("Coach");
        String athleteName = userRepository.findById(training.getAthleteId()).map(User::getFullName).orElse("Athlete");
        return mapToResponse(updated, coachName, athleteName);
    }

    // ===========================
    // CANCEL TRAINING
    // ===========================
    public TrainingResponse cancelTraining(String trainingId, String coachId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training session not found"));

        if (coachId != null && !training.getCoachId().equals(coachId)) {
            throw new SecurityException("Unauthorized to cancel this training session");
        }

        training.setStatus(TrainingStatus.CANCELLED);
        Training saved = trainingRepository.save(training);

        String coachName = userRepository.findById(training.getCoachId()).map(User::getFullName).orElse("Coach");
        String athleteName = userRepository.findById(training.getAthleteId()).map(User::getFullName).orElse("Athlete");
        return mapToResponse(saved, coachName, athleteName);
    }

    // ===========================
    // COMPLETE TRAINING
    // ===========================
    public TrainingResponse completeTraining(String trainingId, String userId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training session not found"));

        if (userId != null && !training.getAthleteId().equals(userId) && !training.getCoachId().equals(userId)) {
            throw new SecurityException("Unauthorized to mark this training session as complete");
        }

        training.setStatus(TrainingStatus.COMPLETED);
        Training saved = trainingRepository.save(training);

        String coachName = userRepository.findById(training.getCoachId()).map(User::getFullName).orElse("Coach");
        String athleteName = userRepository.findById(training.getAthleteId()).map(User::getFullName).orElse("Athlete");
        return mapToResponse(saved, coachName, athleteName);
    }

    private TrainingResponse mapToResponse(Training t, String coachName, String athleteName) {
        return TrainingResponse.builder()
                .id(t.getId())
                .coachId(t.getCoachId())
                .coachName(coachName)
                .athleteId(t.getAthleteId())
                .athleteName(athleteName)
                .title(t.getTitle())
                .description(t.getDescription())
                .category(t.getCategory())
                .date(t.getDate())
                .time(t.getTime())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
