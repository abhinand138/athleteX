package com.athletex.backend.controller;

import com.athletex.backend.dto.WellnessCheckinRequest;
import com.athletex.backend.model.WellnessCheckin;
import com.athletex.backend.service.WellnessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wellness")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WellnessController {

    private final WellnessService wellnessService;

    // POST /api/wellness
    @PostMapping
    public ResponseEntity<?> submitCheckin(
            @RequestBody WellnessCheckinRequest request,
            Authentication authentication) {
        String userId = request.getUserId();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            userId = (String) authentication.getPrincipal();
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        WellnessCheckin checkin = wellnessService.submitCheckin(
                userId,
                request.getSleepQuality(),
                request.getMuscleSoreness(),
                request.getEnergyLevel(),
                request.getNotes()
        );
        return ResponseEntity.ok(checkin);
    }

    // GET /api/wellness/today/{userId}
    @GetMapping("/today/{userId}")
    public ResponseEntity<?> getTodayCheckin(@PathVariable String userId) {
        return wellnessService.getTodayCheckin(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // GET /api/wellness/history/{userId}
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<WellnessCheckin>> getRecentCheckins(@PathVariable String userId) {
        return ResponseEntity.ok(wellnessService.getRecentCheckins(userId));
    }
}
