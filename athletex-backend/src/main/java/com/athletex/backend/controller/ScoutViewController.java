package com.athletex.backend.controller;

import com.athletex.backend.model.ScoutView;
import com.athletex.backend.service.ScoutViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scout-views")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ScoutViewController {

    private final ScoutViewService scoutViewService;

    /*
     * RECORD A PROFILE VIEW
     */
    @PostMapping("/{athleteId}/{scoutId}")
    public ScoutView recordView(
            @PathVariable String athleteId,
            @PathVariable String scoutId
    ) {

        return scoutViewService.recordView(
                athleteId,
                scoutId
        );
    }

    /*
     * GET VIEW COUNT
     */
    @GetMapping("/{athleteId}/count")
    public long getViewCount(
            @PathVariable String athleteId
    ) {

        return scoutViewService.getViewCount(
                athleteId
        );
    }

    /*
     * GET VIEW HISTORY
     */
    @GetMapping("/{athleteId}")
    public List<ScoutView> getViews(
            @PathVariable String athleteId
    ) {

        return scoutViewService.getViews(
                athleteId
        );
    }
}