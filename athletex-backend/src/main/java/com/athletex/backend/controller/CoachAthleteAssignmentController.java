package com.athletex.backend.controller;

import com.athletex.backend.dto.AthleteCardResponse;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.service.CoachAthleteAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coach/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachAthleteAssignmentController {

    private final CoachAthleteAssignmentService assignmentService;

    // POST /api/coach/assignments/{coachId}/{athleteId}
    @PostMapping("/{coachId}/{athleteId}")
    public ResponseEntity<?> assignAthlete(
            @PathVariable String coachId,
            @PathVariable String athleteId) {
        try {
            CoachAthleteAssignment assignment = assignmentService.assignAthlete(coachId, athleteId);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/assignments/coach/{coachId}
    @GetMapping("/coach/{coachId}")
    public ResponseEntity<?> getAthletesForCoach(@PathVariable String coachId) {
        try {
            List<AthleteCardResponse> athletes = assignmentService.getAthletesForCoach(coachId);
            return ResponseEntity.ok(athletes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/assignments/athlete/{athleteId}
    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<?> getCoachForAthlete(@PathVariable String athleteId) {
        try {
            Optional<CoachAthleteAssignment> assignment = assignmentService.getCoachForAthlete(athleteId);
            return assignment
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // GET /api/coach/assignments/athlete/{athleteId}/coach-details
    @GetMapping("/athlete/{athleteId}/coach-details")
    public ResponseEntity<?> getCoachDetailsForAthlete(@PathVariable String athleteId) {
        try {
            return assignmentService.getCoachDetailsForAthlete(athleteId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // DELETE /api/coach/assignments/{coachId}/{athleteId}
    @DeleteMapping("/{coachId}/{athleteId}")
    public ResponseEntity<?> unassignAthlete(
            @PathVariable String coachId,
            @PathVariable String athleteId) {
        try {
            assignmentService.unassignAthlete(coachId, athleteId);
            return ResponseEntity.ok("Athlete unassigned successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/assignments/coach/{coachId}/count
    @GetMapping("/coach/{coachId}/count")
    public ResponseEntity<Long> countAthletes(@PathVariable String coachId) {
        try {
            long count = assignmentService.countAthletesForCoach(coachId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/coach/assignments/available/{coachId}
    @GetMapping("/available/{coachId}")
    public ResponseEntity<?> getAvailableAthletes(@PathVariable String coachId) {
        try {
            List<AthleteCardResponse> athletes = assignmentService.getAvailableAthletes(coachId);
            return ResponseEntity.ok(athletes);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
