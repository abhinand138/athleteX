package com.athletex.backend.controller;

import com.athletex.backend.dto.DashboardResponse;
import com.athletex.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{userId}")
    public DashboardResponse getDashboard(@PathVariable String userId) {

        return dashboardService.getDashboard(userId);
    }
}