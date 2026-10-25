package com.athletex.backend.controller;

import com.athletex.backend.dto.sport.SportWorkloadRequest;
import com.athletex.backend.dto.sport.SportWorkloadSummaryResponse;
import com.athletex.backend.model.SportWorkloadLog;
import com.athletex.backend.service.SportWorkloadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SportWorkloadController {

    private final SportWorkloadService sportWorkloadService;

    /**
     * POST /api/sports/workload/{userId}
     * Logs cricket bowling session or football GPS match data.
     */
    @PostMapping("/workload/{userId}")
    public ResponseEntity<SportWorkloadLog> logSportWorkload(
            @PathVariable String userId,
            @Valid @RequestBody SportWorkloadRequest request
    ) {
        SportWorkloadLog saved = sportWorkloadService.logWorkload(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/sports/workload/{userId}
     * Returns Fast Bowler ACWR or Football Match GPS Analytics.
     */
    @GetMapping("/workload/{userId}")
    public ResponseEntity<SportWorkloadSummaryResponse> getWorkloadSummary(
            @PathVariable String userId,
            @RequestParam(required = false, defaultValue = "CRICKET") String sport
    ) {
        SportWorkloadSummaryResponse summary = sportWorkloadService.getWorkloadSummary(userId, sport);
        return ResponseEntity.ok(summary);
    }
}
