package com.athletex.backend.controller;

import com.athletex.backend.dto.CoachAthleteResponse;
import com.athletex.backend.service.CoachAthleteMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach/athletes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachAthleteMonitoringController {

    private final CoachAthleteMonitoringService monitoringService;

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
}
