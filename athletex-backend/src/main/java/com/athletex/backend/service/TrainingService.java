package com.athletex.backend.service;

import com.athletex.backend.dto.BulkTrainingRequest;
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
    private final PerformanceService performanceService;

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
    // CREATE BULK SQUAD TRAINING SESSIONS (AUTOMATION)
    // ===========================
    public List<TrainingResponse> createBulkTraining(BulkTrainingRequest request) {
        // 1. Verify Coach
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("User is not a coach");
        }

        // 2. Validate Target Athletes
        if (request.getAthleteIds() == null || request.getAthleteIds().isEmpty()) {
            throw new IllegalArgumentException("At least one athlete must be selected");
        }

        Set<String> uniqueAthleteIds = new LinkedHashSet<>(request.getAthleteIds());
        Map<String, User> verifiedAthletes = new HashMap<>();

        for (String athleteId : uniqueAthleteIds) {
            User athlete = userRepository.findById(athleteId).orElse(null);
            if (athlete == null || athlete.getRole() != Role.ATHLETE) {
                continue;
            }
            boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                    request.getCoachId(), athleteId, AssignmentStatus.ACTIVE
            );
            if (isAssigned) {
                verifiedAthletes.put(athleteId, athlete);
            }
        }

        if (verifiedAthletes.isEmpty()) {
            throw new SecurityException("No assigned athletes were found for this coach among the selected targets");
        }

        // 3. Compute Session Dates
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

        // 4. Generate & Save Training Records for each Athlete x Date
        List<Training> trainingsToSave = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (String athleteId : verifiedAthletes.keySet()) {
            for (LocalDate d : sessionDates) {
                Training training = Training.builder()
                        .coachId(request.getCoachId())
                        .athleteId(athleteId)
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
        }

        List<Training> savedList = trainingRepository.saveAll(trainingsToSave);

        // 5. Send Non-blocking Notifications to each athlete
        for (Map.Entry<String, User> entry : verifiedAthletes.entrySet()) {
            try {
                notificationService.sendNotification(
                        entry.getKey(),
                        "Squad Training Program Assigned 👥",
                        "Coach " + coach.getFullName() + " scheduled a " + request.getCategory() + " session: '" + request.getTitle() + "' (" + sessionDates.size() + " session(s))",
                        "TRAINING",
                        "/training"
                );
            } catch (Exception ignored) {
            }
        }

        return savedList.stream()
                .map(t -> {
                    User a = verifiedAthletes.get(t.getAthleteId());
                    String aName = a != null ? a.getFullName() : "Athlete";
                    return mapToResponse(t, coach.getFullName(), aName);
                })
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

        // Trigger Automated Workout-Driven Performance Engine
        try {
            performanceService.recalculatePerformanceFromWorkouts(saved.getAthleteId());
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
                .exercises(t.getExercises())
                .completedAt(t.getCompletedAt())
                .createdAt(t.getCreatedAt())
                .build();
    }

    public List<TrainingResponse> seedDemoWorkouts(String athleteId) {
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        User coach = userRepository.findByRole(Role.COACH).stream().findFirst().orElse(null);
        String coachId = coach != null ? coach.getId() : "coach_demo";
        String coachName = coach != null ? coach.getFullName() : "Coach Marcus Vance";

        Training t1 = Training.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .title("Sprint Acceleration & Explosive Starts")
                .category("SPEED")
                .description("Focus on acceleration mechanics, low drive angle, and high horizontal impulse.")
                .date(LocalDate.now())
                .time("10:00 AM")
                .status(TrainingStatus.SCHEDULED)
                .actualDurationMinutes(45)
                .exercises(List.of(
                        com.athletex.backend.dto.ai.ExerciseDetail.builder().name("Dynamic Leg Swings & High Knees").sets("2 Sets").repsOrDuration("30 sec per side").restInterval("30 sec").coachingNotes("Open hip flexors dynamic activation.").build(),
                        com.athletex.backend.dto.ai.ExerciseDetail.builder().name("Resisted Band 20m Acceleration Drive").sets("4 Sets").repsOrDuration("20 Meters Max Effort").restInterval("90 sec").coachingNotes("Stay low through 10m; drive knees forcefully.").build(),
                        com.athletex.backend.dto.ai.ExerciseDetail.builder().name("Flying 30m Speed Endurance").sets("3 Sets").repsOrDuration("30 Meters Flying").restInterval("120 sec").coachingNotes("Relax upper body and float over ground at top speed.").build()
                ))
                .createdAt(LocalDateTime.now())
                .build();

        Training t2 = Training.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .title("Lower Body Power & Agility Shuttle")
                .category("AGILITY")
                .description("Multi-directional cutting, deceleration control, and reactive plyometrics.")
                .date(LocalDate.now().plusDays(1))
                .time("04:30 PM")
                .status(TrainingStatus.SCHEDULED)
                .actualDurationMinutes(50)
                .exercises(List.of(
                        com.athletex.backend.dto.ai.ExerciseDetail.builder().name("Pro Agility Shuttle 5-10-5").sets("4 Sets").repsOrDuration("Max Deceleration & Cut").restInterval("75 sec").coachingNotes("Drop hips low on turn; plant outside foot firmly.").build(),
                        com.athletex.backend.dto.ai.ExerciseDetail.builder().name("Trap-Bar Deadlifts").sets("4 Sets").repsOrDuration("5 Reps @ 80% 1RM").restInterval("90 sec").coachingNotes("Explosive hip drive, neutral spine.").build()
                ))
                .createdAt(LocalDateTime.now())
                .build();

        Training t3 = Training.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .title("Threshold Aerobic Conditioning")
                .category("ENDURANCE")
                .description("Tempo intervals for aerobic enzyme enhancement.")
                .date(LocalDate.now().minusDays(2))
                .time("08:00 AM")
                .status(TrainingStatus.COMPLETED)
                .actualDurationMinutes(45)
                .rpe(7)
                .athleteFeedback("Solid conditioning block; legs felt bouncy.")
                .completedAt(LocalDateTime.now().minusDays(2))
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        List<Training> saved = trainingRepository.saveAll(List.of(t1, t2, t3));
        try {
            performanceService.recalculatePerformanceFromWorkouts(athleteId);
        } catch (Exception ignored) {}

        return saved.stream()
                .map(t -> mapToResponse(t, coachName, athlete.getFullName()))
                .toList();
    }
}
