package com.athletex.backend.controller;

import com.athletex.backend.dto.TrainingRequest;
import com.athletex.backend.dto.TrainingResponse;
import com.athletex.backend.service.TrainingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingController {

    private final TrainingService trainingService;

    // POST /api/training
    @PostMapping
    public ResponseEntity<?> createTraining(@Valid @RequestBody TrainingRequest request) {
        try {
            TrainingResponse response = trainingService.createTraining(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/training/coach/{coachId}
    @GetMapping("/coach/{coachId}")
    public ResponseEntity<List<TrainingResponse>> getCoachTraining(@PathVariable String coachId) {
        return ResponseEntity.ok(trainingService.getCoachTraining(coachId));
    }

    // GET /api/training/athlete/{athleteId}
    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<List<TrainingResponse>> getAthleteTraining(@PathVariable String athleteId) {
        return ResponseEntity.ok(trainingService.getAthleteTraining(athleteId));
    }

    // GET /api/training/athlete/{athleteId}/upcoming
    @GetMapping("/athlete/{athleteId}/upcoming")
    public ResponseEntity<List<TrainingResponse>> getAthleteUpcomingTraining(@PathVariable String athleteId) {
        return ResponseEntity.ok(trainingService.getAthleteUpcomingTraining(athleteId));
    }

    // PUT /api/training/{trainingId}
    @PutMapping("/{trainingId}")
    public ResponseEntity<?> updateTraining(
            @PathVariable String trainingId,
            @Valid @RequestBody TrainingRequest request) {
        try {
            TrainingResponse response = trainingService.updateTraining(trainingId, request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/training/{trainingId}
    @DeleteMapping("/{trainingId}")
    public ResponseEntity<?> cancelTraining(
            @PathVariable String trainingId,
            @RequestParam(required = false) String coachId) {
        try {
            TrainingResponse response = trainingService.cancelTraining(trainingId, coachId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/training/{trainingId}/complete
    @PutMapping("/{trainingId}/complete")
    public ResponseEntity<?> completeTraining(
            @PathVariable String trainingId,
            @RequestParam(required = false) String userId) {
        try {
            TrainingResponse response = trainingService.completeTraining(trainingId, userId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
