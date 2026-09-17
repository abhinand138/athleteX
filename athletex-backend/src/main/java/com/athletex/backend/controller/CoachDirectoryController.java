package com.athletex.backend.controller;

import com.athletex.backend.dto.CoachPublicProfileDto;
import com.athletex.backend.service.CoachDirectoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachDirectoryController {

    private final CoachDirectoryService coachDirectoryService;

    @GetMapping("/directory")
    public ResponseEntity<List<CoachPublicProfileDto>> getCoachDirectory(
            @RequestParam(required = false) String athleteId,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String search) {

        List<CoachPublicProfileDto> coaches = coachDirectoryService.getCoachDirectory(athleteId, sport, search);
        return ResponseEntity.ok(coaches);
    }
}
