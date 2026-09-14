package com.athletex.backend.service;

import com.athletex.backend.dto.RecurringTrainingRequest;
import com.athletex.backend.dto.TrainingRequest;
import com.athletex.backend.dto.TrainingResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;

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

        // Send automatic notification to athlete
        try {
            notificationService.sendNotification(
                    request.getAthleteId(),
                    "New Training Plan Assigned 🏋️",
                    "Coach " + coach.getFullName() + " assigned a new training plan: '" + saved.getTitle() + "'",
                    "TRAINING",
                    "/training"
            );
        } catch (Exception e) {
            // Non-blocking notification
        }

        return mapToResponse(saved, coach.getFullName(), athlete.getFullName());
    }

    // ===========================
    // CREATE RECURRING TRAINING SESSIONS (AUTOMATION)
    // ===========================
    public List<TrainingResponse> createRecurringTraining(RecurringTrainingRequest request) {
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

        int weeks = (request.getRepeatWeeks() != null && request.getRepeatWeeks() > 0)
                ? request.getRepeatWeeks() : 1;

        LocalDate startDate = request.getStartDate();
        Set<LocalDate> sessionDates = new TreeSet<>();

        if (request.getRepeatDays() != null && !request.getRepeatDays().isEmpty()) {
            Set<DayOfWeek> targetDays = new HashSet<>();
            for (String dayStr : request.getRepeatDays()) {
                try {
                    targetDays.add(DayOfWeek.valueOf(dayStr.trim().toUpperCase()));
                } catch (IllegalArgumentException ignored) {}
            }

            if (targetDays.isEmpty()) {
                targetDays.add(startDate.getDayOfWeek());
            }

            LocalDate weekStart = startDate.with(DayOfWeek.MONDAY);
            for (int w = 0; w < weeks; w++) {
                LocalDate currentWeek = weekStart.plusWeeks(w);
                for (DayOfWeek dow : targetDays) {
                    LocalDate candidateDate = currentWeek.with(dow);
                    if (!candidateDate.isBefore(startDate)) {
                        sessionDates.add(candidateDate);
                    }
                }
            }
        } else {
            for (int w = 0; w < weeks; w++) {
                sessionDates.add(startDate.plusWeeks(w));
            }
        }

        if (sessionDates.isEmpty()) {
            sessionDates.add(startDate);
        }

        List<Training> trainingsToSave = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (LocalDate d : sessionDates) {
            Training training = Training.builder()
                    .coachId(request.getCoachId())
                    .athleteId(request.getAthleteId())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .date(d)
                    .time(request.getTime())
                    .status(TrainingStatus.SCHEDULED)
                    .createdAt(now)
                    .build();
            trainingsToSave.add(training);
        }

        List<Training> savedList = trainingRepository.saveAll(trainingsToSave);

        try {
            notificationService.sendNotification(
                    request.getAthleteId(),
                    "New Automated Training Routine 🚀",
                    "Coach " + coach.getFullName() + " scheduled a " + weeks + "-week " + request.getCategory() + " routine: '" + request.getTitle() + "' (" + savedList.size() + " sessions scheduled)",
                    "TRAINING",
                    "/training"
            );
        } catch (Exception e) {
            // Non-blocking notification
        }

        return savedList.stream()
                .map(t -> mapToResponse(t, coach.getFullName(), athlete.getFullName()))
                .collect(Collectors.toList());
    }

    // ===========================
    // AUTOMATED MISSED SESSION DETECTION
    // Runs at the top of every hour and is also synchronized on query fetches
    // ===========================
    @Scheduled(cron = "0 0 * * * *")
    public int autoMarkMissedTrainings() {
        LocalDate today = LocalDate.now();
        List<Training> pastScheduled = trainingRepository.findByStatusAndDateBefore(TrainingStatus.SCHEDULED, today);
        if (pastScheduled == null || pastScheduled.isEmpty()) {
            return 0;
        }

        for (Training t : pastScheduled) {
            t.setStatus(TrainingStatus.MISSED);
        }
        trainingRepository.saveAll(pastScheduled);
        return pastScheduled.size();
    }

    // ===========================
    // GET COACH TRAININGS
    // ===========================
    public List<TrainingResponse> getCoachTraining(String coachId) {
        autoMarkMissedTrainings();
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
        autoMarkMissedTrainings();
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
        autoMarkMissedTrainings();
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

        try {
            notificationService.notifyTrainingCancelled(saved, coachId, coachName, athleteName);
        } catch (Exception e) {
            // Non-blocking
        }

        return mapToResponse(saved, coachName, athleteName);
    }

    // ===========================
    // COMPLETE TRAINING
    // ===========================
    public TrainingResponse completeTraining(String trainingId, String userId) {
        return completeTraining(trainingId, userId, null, null, null);
    }

    public TrainingResponse completeTraining(
            String trainingId,
            String userId,
            Integer rpe,
            Integer actualDurationMinutes,
            String athleteFeedback
    ) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training session not found"));

        if (userId != null && !training.getAthleteId().equals(userId) && !training.getCoachId().equals(userId)) {
            throw new SecurityException("Unauthorized to mark this training session as complete");
        }

        training.setStatus(TrainingStatus.COMPLETED);
        training.setCompletedAt(LocalDateTime.now());
        if (rpe != null) training.setRpe(rpe);
        if (actualDurationMinutes != null) training.setActualDurationMinutes(actualDurationMinutes);
        if (athleteFeedback != null && !athleteFeedback.isBlank()) training.setAthleteFeedback(athleteFeedback.trim());

        Training saved = trainingRepository.save(training);

        String coachName = userRepository.findById(training.getCoachId()).map(User::getFullName).orElse("Coach");
        String athleteName = userRepository.findById(training.getAthleteId()).map(User::getFullName).orElse("Athlete");

        try {
            notificationService.notifyTrainingCompleted(saved, userId, coachName, athleteName);
        } catch (Exception e) {
            // Non-blocking
        }

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
                .rpe(t.getRpe())
                .actualDurationMinutes(t.getActualDurationMinutes())
                .athleteFeedback(t.getAthleteFeedback())
                .completedAt(t.getCompletedAt())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
