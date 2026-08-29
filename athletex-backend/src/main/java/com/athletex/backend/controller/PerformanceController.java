package com.athletex.backend.controller;

import com.athletex.backend.model.Performance;
import com.athletex.backend.model.PerformanceHistory;
import com.athletex.backend.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceController {

    private final PerformanceService performanceService;


    /*
     * GET PERFORMANCE
     */
    @GetMapping("/{userId}")
    public Performance getPerformance(
            @PathVariable String userId
    ) {

        return performanceService.getPerformance(userId);
    }


    /*
     * UPDATE PERFORMANCE
     */
    @PutMapping("/{userId}")
    public Performance updatePerformance(
            @PathVariable String userId,
            @RequestBody Performance performance
    ) {

        return performanceService.updatePerformance(
                userId,
                performance.getSpeed(),
                performance.getStrength(),
                performance.getEndurance(),
                performance.getAgility()
        );
    }

    @PutMapping("/{userId}/verify")
    public Performance verifyPerformanceByCoach(
            @PathVariable String userId,
            @RequestParam String coachId
    ) {
        return performanceService.verifyPerformanceByCoach(userId, coachId);
    }

    /*
     * GET PERFORMANCE HISTORY
     */
    @GetMapping("/{userId}/history")
    public List<PerformanceHistory> getPerformanceHistory(
            @PathVariable String userId
    ) {
        return performanceService.getPerformanceHistory(userId);
    }
}