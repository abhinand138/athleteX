package com.athletex.backend.controller;

import com.athletex.backend.dto.analytics.AthleteComparisonDto;
import com.athletex.backend.dto.analytics.CoachAnalyticsResponse;
import com.athletex.backend.service.CoachAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachAnalyticsController {

    private final CoachAnalyticsService coachAnalyticsService;

    @GetMapping("/{coachId}")
    public ResponseEntity<?> getCoachAnalytics(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        try {
            CoachAnalyticsResponse response = coachAnalyticsService.getCoachAnalytics(coachId, range);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{coachId}/compare")
    public ResponseEntity<?> compareAthletes(
            @PathVariable String coachId,
            @RequestBody List<String> athleteIds) {
        try {
            List<AthleteComparisonDto> response = coachAnalyticsService.getAthleteComparison(coachId, athleteIds);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
