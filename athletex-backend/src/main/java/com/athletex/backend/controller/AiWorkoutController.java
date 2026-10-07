package com.athletex.backend.controller;

import com.athletex.backend.dto.ai.AiWorkoutPlanDto;
import com.athletex.backend.dto.ai.AiWorkoutRequest;
import com.athletex.backend.model.Training;
import com.athletex.backend.service.AiWorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiWorkoutController {

    private final AiWorkoutService aiWorkoutService;

    private String resolveUserId(String explicitUserId) {
        if (explicitUserId != null && !explicitUserId.trim().isEmpty() && !"null".equalsIgnoreCase(explicitUserId) && !"undefined".equalsIgnoreCase(explicitUserId)) {
            return explicitUserId;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    // POST /api/ai/generate-workout
    @PostMapping("/generate-workout")
    public ResponseEntity<AiWorkoutPlanDto> generateWorkout(@RequestBody AiWorkoutRequest request) {
        AiWorkoutPlanDto plan = aiWorkoutService.generateWorkout(request);
        return ResponseEntity.ok(plan);
    }

    // POST /api/ai/assign-workout
    @PostMapping("/assign-workout")
    public ResponseEntity<Training> assignWorkout(
            @RequestParam String athleteId,
            @RequestBody AiWorkoutPlanDto planDto,
            @RequestParam(required = false) String coachId) {
        String cid = resolveUserId(coachId);
        if (cid == null) {
            return ResponseEntity.badRequest().build();
        }
        Training assigned = aiWorkoutService.assignAiWorkoutToAthlete(cid, athleteId, planDto);
        return ResponseEntity.ok(assigned);
    }
}
