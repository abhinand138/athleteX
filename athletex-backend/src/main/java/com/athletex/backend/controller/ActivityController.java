package com.athletex.backend.controller;

import com.athletex.backend.model.Activity;
import com.athletex.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/{userId}")
    public List<Activity> getUserActivities(@PathVariable String userId) {
        return activityService.getUserActivities(userId);
    }
}
