package com.athletex.backend.service;

import com.athletex.backend.dto.GoalRequest;
import com.athletex.backend.model.Goal;
import com.athletex.backend.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final ActivityService activityService;

    public List<Goal> getGoals(String userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Goal createGoal(String userId, GoalRequest request) {
        Goal goal = Goal.builder()
                .userId(userId)
                .title(request.getTitle() != null ? request.getTitle().trim() : "Personal Goal")
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "GENERAL")
                .targetValue(request.getTargetValue() != null ? request.getTargetValue() : 100.0)
                .currentValue(request.getCurrentValue() != null ? request.getCurrentValue() : 0.0)
                .unit(request.getUnit() != null ? request.getUnit().trim() : "%")
                .targetDate(request.getTargetDate())
                .completed(Boolean.TRUE.equals(request.getCompleted()))
                .createdAt(LocalDateTime.now())
                .build();

        Goal saved = goalRepository.save(goal);

        try {
            activityService.createActivity(
                    userId,
                    "goal",
                    "New Goal Created",
                    "Set target: " + saved.getTitle(),
                    "🎯"
            );
        } catch (Exception ignored) {}

        return saved;
    }

    public Goal updateGoal(String goalId, String userId, GoalRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized to update this goal");
        }

        if (request.getTitle() != null) goal.setTitle(request.getTitle().trim());
        if (request.getCategory() != null) goal.setCategory(request.getCategory().toUpperCase());
        if (request.getTargetValue() != null) goal.setTargetValue(request.getTargetValue());
        if (request.getCurrentValue() != null) goal.setCurrentValue(request.getCurrentValue());
        if (request.getUnit() != null) goal.setUnit(request.getUnit().trim());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());

        boolean wasCompleted = goal.isCompleted();
        if (request.getCompleted() != null) {
            goal.setCompleted(request.getCompleted());
            if (!wasCompleted && request.getCompleted()) {
                try {
                    activityService.createActivity(
                            userId,
                            "goal_completed",
                            "Goal Accomplished! 🎉",
                            "Successfully hit goal: " + goal.getTitle(),
                            "🏆"
                    );
                } catch (Exception ignored) {}
            }
        }

        return goalRepository.save(goal);
    }

    public void deleteGoal(String goalId, String userId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized to delete this goal");
        }

        goalRepository.delete(goal);
    }
}
