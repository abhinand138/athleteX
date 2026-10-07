package com.athletex.backend.service;

import com.athletex.backend.dto.ai.AiWorkoutPlanDto;
import com.athletex.backend.dto.ai.AiWorkoutRequest;
import com.athletex.backend.dto.ai.ExerciseDetail;
import com.athletex.backend.model.Training;
import com.athletex.backend.model.TrainingStatus;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiWorkoutService {

    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AiWorkoutPlanDto generateWorkout(AiWorkoutRequest request) {
        String sport = request.getSport() != null && !request.getSport().isBlank() ? request.getSport() : "General Athletics";
        String focusArea = request.getFocusArea() != null && !request.getFocusArea().isBlank() ? request.getFocusArea() : "Explosive Speed";
        String intensity = request.getIntensity() != null && !request.getIntensity().isBlank() ? request.getIntensity() : "ADVANCED";
        int duration = request.getDurationMinutes() != null ? request.getDurationMinutes() : 45;

        // Warmup exercises
        List<ExerciseDetail> warmup = new ArrayList<>();
        warmup.add(ExerciseDetail.builder()
                .name("Dynamic Leg Swings & High Knees")
                .sets("2 Sets")
                .repsOrDuration("30 sec per side")
                .restInterval("15 sec")
                .coachingNotes("Open hip flexors and activate hamstrings dynamically.")
                .build());
        warmup.add(ExerciseDetail.builder()
                .name("Glute Bridges & Banded Lateral Walks")
                .sets("3 Sets")
                .repsOrDuration("12 Reps")
                .restInterval("30 sec")
                .coachingNotes("Focus on glute activation before high-speed sprints.")
                .build());

        // Main Drills tailored to focus area
        List<ExerciseDetail> mainDrills = new ArrayList<>();
        if (focusArea.toLowerCase().contains("speed") || focusArea.toLowerCase().contains("sprint")) {
            mainDrills.add(ExerciseDetail.builder()
                    .name("Resisted Band Acceleration Sprints (20m)")
                    .sets("4 Sets")
                    .repsOrDuration("20 Meters Max Effort")
                    .restInterval("90 sec rest")
                    .coachingNotes("Maintain low drive phase angle and high ground contact frequency.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Plyometric Depth Jumps to Sprint")
                    .sets("3 Sets")
                    .repsOrDuration("5 Jumps + 15m Sprint")
                    .restInterval("2 min rest")
                    .coachingNotes("Minimize ground contact time on jump landings.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Flying 30m Speed Endurance")
                    .sets("3 Sets")
                    .repsOrDuration("30 Meters Flying Sprint")
                    .restInterval("2.5 min rest")
                    .coachingNotes("Maintain relaxed upper body form at top speed.")
                    .build());
        } else if (focusArea.toLowerCase().contains("strength") || focusArea.toLowerCase().contains("power")) {
            mainDrills.add(ExerciseDetail.builder()
                    .name("Barbell Trap-Bar Deadlifts")
                    .sets("4 Sets")
                    .repsOrDuration("5 Reps @ 80% 1RM")
                    .restInterval("2 min rest")
                    .coachingNotes("Drive forcefully through heels with neutral spine.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Single-Leg Bulgarian Split Squats")
                    .sets("3 Sets")
                    .repsOrDuration("8 Reps / leg")
                    .restInterval("90 sec rest")
                    .coachingNotes("Focus on unilateral hip stability and quad engagement.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Medicine Ball Overhead Explosive Throws")
                    .sets("4 Sets")
                    .repsOrDuration("6 Throws (6kg ball)")
                    .restInterval("60 sec rest")
                    .coachingNotes("Triple extension through ankles, knees, and hips.")
                    .build());
        } else if (focusArea.toLowerCase().contains("endurance")) {
            mainDrills.add(ExerciseDetail.builder()
                    .name("Threshold Interval Shuttle Runs")
                    .sets("5 Sets")
                    .repsOrDuration("3 mins @ 85% VO2 Max")
                    .restInterval("90 sec jog rest")
                    .coachingNotes("Maintain rhythmic breathing and steady pace.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Tabata Bodyweight Circuit")
                    .sets("4 Rounds")
                    .repsOrDuration("20s On / 10s Off")
                    .restInterval("60 sec round rest")
                    .coachingNotes("High heart rate conditioning protocol.")
                    .build());
        } else {
            mainDrills.add(ExerciseDetail.builder()
                    .name("90/90 Hip Mobility & Thoracic Rotations")
                    .sets("3 Sets")
                    .repsOrDuration("10 Reps per side")
                    .restInterval("45 sec rest")
                    .coachingNotes("Increase joint range of motion and decrease stiffness.")
                    .build());
            mainDrills.add(ExerciseDetail.builder()
                    .name("Foam Rolling & Active Hamstring Stretch")
                    .sets("1 Round")
                    .repsOrDuration("60 sec per muscle group")
                    .restInterval("Self-paced")
                    .coachingNotes("Myofascial release for faster muscular recovery.")
                    .build());
        }

        // Cooldown
        List<ExerciseDetail> cooldown = new ArrayList<>();
        cooldown.add(ExerciseDetail.builder()
                .name("Low Intensity Walk & Deep Diaphragmatic Breathing")
                .sets("1 Set")
                .repsOrDuration("5 Minutes")
                .restInterval("None")
                .coachingNotes("Lower heart rate back to baseline.")
                .build());
        cooldown.add(ExerciseDetail.builder()
                .name("Static PNF Calve & Hip Flexor Stretch")
                .sets("2 Sets")
                .repsOrDuration("45 sec hold per side")
                .restInterval("15 sec")
                .coachingNotes("Prevent post-session soreness and tightness.")
                .build());

        int estimatedCalories = Math.round(duration * 9.5f);
        String title = "AI " + focusArea + " Program (" + sport + ")";
        String summary = "Custom " + duration + "-minute AI-engineered program targeting " + focusArea.toLowerCase() + " for " + sport + " athletes at " + intensity.toLowerCase() + " level.";

        String aiCoachTip = "AI Insight: Ensure total rest intervals between sprint drills are respected. Complete ground contact recovery maximizes power output during the main acceleration phase.";

        return AiWorkoutPlanDto.builder()
                .title(title)
                .summary(summary)
                .sport(sport)
                .focusArea(focusArea)
                .targetIntensity(intensity)
                .totalDurationMinutes(duration)
                .estimatedCaloriesBurned(estimatedCalories)
                .warmupExercises(warmup)
                .mainDrills(mainDrills)
                .cooldownExercises(cooldown)
                .aiCoachTip(aiCoachTip)
                .build();
    }

    public Training assignAiWorkoutToAthlete(String coachId, String athleteId, AiWorkoutPlanDto planDto) {
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        StringBuilder descBuilder = new StringBuilder();
        descBuilder.append("🤖 AI-Generated Training Program\n\n");
        descBuilder.append("Focus Area: ").append(planDto.getFocusArea()).append("\n");
        descBuilder.append("Intensity: ").append(planDto.getTargetIntensity()).append("\n");
        descBuilder.append("Est. Calories: ").append(planDto.getEstimatedCaloriesBurned()).append(" kcal\n\n");

        descBuilder.append("--- MAIN DRILLS ---\n");
        if (planDto.getMainDrills() != null) {
            for (ExerciseDetail d : planDto.getMainDrills()) {
                descBuilder.append("• ").append(d.getName())
                        .append(" | ").append(d.getSets())
                        .append(" x ").append(d.getRepsOrDuration()).append("\n");
            }
        }
        descBuilder.append("\n💡 AI Tip: ").append(planDto.getAiCoachTip());

        Training training = Training.builder()
                .coachId(coachId)
                .athleteId(athleteId)
                .title(planDto.getTitle())
                .description(descBuilder.toString())
                .category("AI_" + (planDto.getFocusArea() != null ? planDto.getFocusArea().toUpperCase().replace(" ", "_") : "TRAINING"))
                .date(LocalDate.now().plusDays(1))
                .time("09:00 AM")
                .status(TrainingStatus.SCHEDULED)
                .actualDurationMinutes(planDto.getTotalDurationMinutes())
                .createdAt(LocalDateTime.now())
                .build();

        Training saved = trainingRepository.save(training);

        // Notify Athlete
        try {
            notificationService.sendNotification(
                    athleteId,
                    "New AI Training Assigned",
                    "Coach assigned an AI-generated session: " + planDto.getTitle(),
                    "TRAINING",
                    "/training"
            );
        } catch (Exception e) {
            // ignore failure
        }

        return saved;
    }
}
