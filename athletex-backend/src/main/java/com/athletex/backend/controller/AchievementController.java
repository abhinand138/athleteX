package com.athletex.backend.controller;

import com.athletex.backend.model.Achievement;
import com.athletex.backend.service.AchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AchievementController {

    private final AchievementService achievementService;

    /*
     * GET ALL ACHIEVEMENTS
     */
    @GetMapping("/{userId}")
    public List<Achievement> getAchievements(
            @PathVariable String userId
    ) {

        return achievementService.getAchievements(userId);
    }

    /*
     * GET ACHIEVEMENT COUNT
     */
    @GetMapping("/{userId}/count")
    public long getAchievementCount(
            @PathVariable String userId
    ) {

        return achievementService.getAchievementCount(userId);
    }

    /*
     * CREATE ACHIEVEMENT
     */
    @PostMapping("/{userId}")
    public Achievement createAchievement(
            @PathVariable String userId,
            @RequestBody Achievement achievement
    ) {

        return achievementService.createAchievement(
                userId,
                achievement
        );
    }
}