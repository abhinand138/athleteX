package com.athletex.backend.controller;

import com.athletex.backend.dto.PublicVerificationResponse;
import com.athletex.backend.service.PublicVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicVerificationController {

    private final PublicVerificationService publicVerificationService;

    @GetMapping("/verify/{athleteId}")
    public ResponseEntity<?> getPublicVerification(@PathVariable String athleteId) {
        PublicVerificationResponse response = publicVerificationService.getPublicVerification(athleteId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
