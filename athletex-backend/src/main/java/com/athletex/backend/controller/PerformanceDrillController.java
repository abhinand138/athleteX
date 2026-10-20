package com.athletex.backend.controller;

import com.athletex.backend.dto.drill.CoachReviewDrillRequest;
import com.athletex.backend.dto.drill.CombineSummaryResponse;
import com.athletex.backend.dto.drill.LogDrillRequest;
import com.athletex.backend.dto.drill.PendingDrillReviewResponse;
import com.athletex.backend.model.Performance;
import com.athletex.backend.model.PerformanceDrill;
import com.athletex.backend.service.PerformanceDrillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PerformanceDrillController {

    private final PerformanceDrillService drillService;

    /**
     * GET /api/performance/{userId}/combine
     * Returns full combine overview, PR list, recent attempts, and benchmark-derived scores.
     */
    @GetMapping("/{userId}/combine")
    public ResponseEntity<CombineSummaryResponse> getCombineSummary(@PathVariable String userId) {
        return ResponseEntity.ok(drillService.getCombineSummary(userId));
    }

    /**
     * POST /api/performance/{userId}/drills
     * Logs a new combine test attempt and evaluates whether it sets a new PR.
     */
    @PostMapping("/{userId}/drills")
    public ResponseEntity<PerformanceDrill> logDrill(
            @PathVariable String userId,
            @Valid @RequestBody LogDrillRequest request) {
        PerformanceDrill created = drillService.logDrill(userId, request);
        return ResponseEntity.ok(created);
    }

    /**
     * GET /api/performance/{userId}/drills/{drillCode}/history
     * Returns historical attempts for a specific drill code (e.g. "40_YARD_DASH").
     */
    @GetMapping("/{userId}/drills/{drillCode}/history")
    public ResponseEntity<List<PerformanceDrill>> getDrillHistory(
            @PathVariable String userId,
            @PathVariable String drillCode) {
        return ResponseEntity.ok(drillService.getDrillHistory(userId, drillCode));
    }

    /**
     * DELETE /api/performance/{userId}/drills/{drillId}
     * Deletes a drill attempt and updates the PR if necessary.
     */
    @DeleteMapping("/{userId}/drills/{drillId}")
    public ResponseEntity<Void> deleteDrill(
            @PathVariable String userId,
            @PathVariable String drillId) {
        boolean deleted = drillService.deleteDrill(drillId, userId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * POST /api/performance/{userId}/combine/sync-ratings
     * Automatically syncs and updates the 0-100 Speed/Strength/Endurance/Agility ratings on Performance
     * using the athlete's verified combine test PRs.
     */
    @PostMapping("/{userId}/combine/sync-ratings")
    public ResponseEntity<Performance> syncRatingsFromPrs(@PathVariable String userId) {
        Performance updated = drillService.syncRatingsFromPrs(userId);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/performance/drills/{drillId}/review
     * Allows a coach to certify (APPROVED) or request re-test with feedback (REJECTED) for an athlete's combine drill.
     */
    @PutMapping("/drills/{drillId}/review")
    public ResponseEntity<PerformanceDrill> reviewDrill(
            @PathVariable String drillId,
            @RequestParam String coachId,
            @Valid @RequestBody CoachReviewDrillRequest request) {
        PerformanceDrill reviewed = drillService.reviewDrill(drillId, coachId, request);
        return ResponseEntity.ok(reviewed);
    }

    /**
     * GET /api/performance/coach/{coachId}/pending-drills
     * Returns all combine drill submissions currently pending review across the coach's active roster.
     */
    @GetMapping("/coach/{coachId}/pending-drills")
    public ResponseEntity<List<PendingDrillReviewResponse>> getPendingDrillsForCoach(
            @PathVariable String coachId) {
        return ResponseEntity.ok(drillService.getPendingDrillsForCoach(coachId));
    }

    /**
     * GET /api/performance/coach/{coachId}/athlete/{athleteId}/drills
     * Returns all combine drills for a specific athlete assigned to this coach.
     */
    @GetMapping("/coach/{coachId}/athlete/{athleteId}/drills")
    public ResponseEntity<List<PerformanceDrill>> getAthleteDrillsForCoach(
            @PathVariable String coachId,
            @PathVariable String athleteId) {
        return ResponseEntity.ok(drillService.getAthleteDrillsForCoach(coachId, athleteId));
    }

    /**
     * PUT /api/performance/{userId}/drills/{drillId}/verify
     * Allows a coach to verify a combine drill attempt (backwards compatibility).
     */
    @PutMapping("/{userId}/drills/{drillId}/verify")
    public ResponseEntity<PerformanceDrill> verifyDrill(
            @PathVariable String userId,
            @PathVariable String drillId,
            @RequestParam String coachId) {
        PerformanceDrill verified = drillService.verifyDrillByCoach(drillId, coachId);
        return ResponseEntity.ok(verified);
    }
}
