package com.athletex.backend.controller;

import com.athletex.backend.dto.CoachDashboardResponse;
import com.athletex.backend.service.CoachDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coach/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachDashboardController {

    private final CoachDashboardService coachDashboardService;

    @GetMapping("/{coachId}")
    public ResponseEntity<CoachDashboardResponse> getDashboard(@PathVariable String coachId) {
        try {
            CoachDashboardResponse response = coachDashboardService.getDashboard(coachId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
