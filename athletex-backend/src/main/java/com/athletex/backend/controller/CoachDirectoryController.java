package com.athletex.backend.controller;

import com.athletex.backend.dto.ConnectionRequestDto;
import com.athletex.backend.dto.CoachPublicProfileDto;
import com.athletex.backend.model.CoachConnectionRequest;
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

    @PostMapping("/connection-request")
    public ResponseEntity<String> sendConnectionRequest(@RequestBody ConnectionRequestDto dto) {
        try {
            String result = coachDirectoryService.sendConnectionRequest(dto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send connection request.");
        }
    }

    @GetMapping("/connection-requests/{coachId}")
    public ResponseEntity<List<CoachConnectionRequest>> getPendingRequestsForCoach(@PathVariable String coachId) {
        List<CoachConnectionRequest> requests = coachDirectoryService.getPendingRequestsForCoach(coachId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/connection-requests/{requestId}/respond")
    public ResponseEntity<String> respondToConnectionRequest(
            @PathVariable String requestId,
            @RequestParam String status) {
        try {
            String result = coachDirectoryService.respondToRequest(requestId, status);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to process response.");
        }
    }
}
