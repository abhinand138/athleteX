package com.athletex.backend.controller;

import com.athletex.backend.dto.CoachAthleteResponse;
import com.athletex.backend.dto.CoachEvaluationRequest;
import com.athletex.backend.dto.CoachEvaluationResponse;
import com.athletex.backend.service.CoachAthleteMonitoringService;
import com.athletex.backend.service.CoachEvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach/athletes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachAthleteMonitoringController {

    private final CoachAthleteMonitoringService monitoringService;
    private final CoachEvaluationService evaluationService;

    @GetMapping("/{coachId}/{athleteId}")
    public ResponseEntity<?> getAthleteMonitoringDetails(
            @PathVariable String coachId,
            @PathVariable String athleteId) {
        try {
            CoachAthleteResponse response = monitoringService.getAthleteMonitoringDetails(coachId, athleteId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/evaluation")
    public ResponseEntity<?> saveEvaluation(
            @Valid @RequestBody CoachEvaluationRequest request,
            @RequestParam(required = false) String coachId,
            Authentication authentication) {
        String effectiveCoachId = coachId != null ? coachId : request.getCoachId();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            effectiveCoachId = (String) authentication.getPrincipal();
        }

        try {
            CoachEvaluationResponse response = evaluationService.saveOrUpdateEvaluation(effectiveCoachId, request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/evaluation/{coachId}/{athleteId}")
    public ResponseEntity<?> getEvaluation(
            @PathVariable String coachId,
            @PathVariable String athleteId) {
        try {
            CoachEvaluationResponse response = evaluationService.getLatestEvaluation(coachId, athleteId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
