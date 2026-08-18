package com.athletex.backend.controller;

import com.athletex.backend.dto.AchievementRequest;
import com.athletex.backend.dto.AchievementResponse;
import com.athletex.backend.dto.AchievementStatsResponse;
import com.athletex.backend.model.Achievement;
import com.athletex.backend.service.AchievementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AchievementController {

    private final AchievementService achievementService;

    // POST /api/achievements
    @PostMapping
    public ResponseEntity<?> createAchievement(@Valid @RequestBody AchievementRequest request) {
        try {
            AchievementResponse response = achievementService.createAchievement(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/achievements/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getAchievementById(@PathVariable String id) {
        try {
            AchievementResponse response = achievementService.getAchievementById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Fallback check if it's actually an athleteId for legacy route
            List<AchievementResponse> athleteList = achievementService.getAchievementsByAthlete(id);
            if (!athleteList.isEmpty()) {
                return ResponseEntity.ok(athleteList);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // GET /api/achievements/athlete/{athleteId}
    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<List<AchievementResponse>> getAthleteAchievements(@PathVariable String athleteId) {
        return ResponseEntity.ok(achievementService.getAchievementsByAthlete(athleteId));
    }

    // GET /api/achievements/coach/{coachId}
    @GetMapping("/coach/{coachId}")
    public ResponseEntity<List<AchievementResponse>> getCoachAchievements(@PathVariable String coachId) {
        return ResponseEntity.ok(achievementService.getAchievementsByCoach(coachId));
    }

    // GET /api/achievements/coach/{coachId}/stats
    @GetMapping("/coach/{coachId}/stats")
    public ResponseEntity<AchievementStatsResponse> getCoachStats(@PathVariable String coachId) {
        return ResponseEntity.ok(achievementService.getCoachAchievementStats(coachId));
    }

    // PUT /api/achievements/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAchievement(
            @PathVariable String id,
            @Valid @RequestBody AchievementRequest request) {
        try {
            AchievementResponse response = achievementService.updateAchievement(id, request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/achievements/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAchievement(
            @PathVariable String id,
            @RequestParam(required = false) String coachId) {
        try {
            achievementService.deleteAchievement(id, coachId);
            return ResponseEntity.ok("Achievement deleted successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/achievements/athlete/{athleteId}/count
    @GetMapping("/athlete/{athleteId}/count")
    public ResponseEntity<Long> getAthleteAchievementCount(@PathVariable String athleteId) {
        return ResponseEntity.ok(achievementService.getAchievementCount(athleteId));
    }

    // Legacy GET /api/achievements/{userId}/count
    @GetMapping("/{userId}/count")
    public ResponseEntity<Long> getLegacyAchievementCount(@PathVariable String userId) {
        return ResponseEntity.ok(achievementService.getAchievementCount(userId));
    }

    // Legacy POST /api/achievements/{userId}
    @PostMapping("/{userId}")
    public ResponseEntity<Achievement> createLegacyAchievement(
            @PathVariable String userId,
            @RequestBody Achievement achievement) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(achievementService.createAchievement(userId, achievement));
    }
}