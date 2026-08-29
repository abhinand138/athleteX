package com.athletex.backend.controller;

import com.athletex.backend.dto.GoalRequest;
import com.athletex.backend.model.Goal;
import com.athletex.backend.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    private final GoalService goalService;

    // GET /api/goals/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getGoals(
            @PathVariable String userId,
            Authentication authentication) {
        String effectiveUserId = resolveUserId(authentication, userId);
        return ResponseEntity.ok(goalService.getGoals(effectiveUserId));
    }

    // POST /api/goals
    @PostMapping
    public ResponseEntity<?> createGoal(
            @RequestBody GoalRequest request,
            Authentication authentication) {
        String effectiveUserId = resolveUserId(authentication, request.getUserId());
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            Goal goal = goalService.createGoal(effectiveUserId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(goal);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/goals/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(
            @PathVariable String id,
            @RequestBody GoalRequest request,
            Authentication authentication) {
        String effectiveUserId = resolveUserId(authentication, request.getUserId());
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            Goal goal = goalService.updateGoal(id, effectiveUserId, request);
            return ResponseEntity.ok(goal);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/goals/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        String effectiveUserId = resolveUserId(authentication, userId);
        if (effectiveUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            goalService.deleteGoal(id, effectiveUserId);
            return ResponseEntity.ok("Goal deleted");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String resolveUserId(Authentication authentication, String fallback) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return (String) authentication.getPrincipal();
        }
        return fallback;
    }
}
