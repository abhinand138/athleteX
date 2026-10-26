package com.athletex.backend.controller;

import com.athletex.backend.dto.LoginResponse;
import com.athletex.backend.dto.LoginRequest;
import com.athletex.backend.dto.RegisterRequest;
import com.athletex.backend.service.AuthService;
import com.athletex.backend.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@Valid @RequestBody com.athletex.backend.dto.VerifyOtpRequest request) {
        return authService.verifyOtp(request.getEmail(), request.getOtp());
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, Object>> resendOtp(@RequestParam String email) {
        String cleanEmail = email != null ? email.trim() : "";
        String msg = authService.resendOtp(cleanEmail);
        boolean isSmtp = emailService.isSmtpConfigured();
        return ResponseEntity.ok(Map.of(
                "message", msg,
                "smtpConfigured", isSmtp
        ));
    }

    @GetMapping("/dev-otp")
    public ResponseEntity<Map<String, Object>> getDevOtp(@RequestParam String email) {
        String cleanEmail = email != null ? email.trim() : "";
        String otp = authService.getDevOtp(cleanEmail);
        boolean isSmtp = emailService.isSmtpConfigured();
        return ResponseEntity.ok(Map.of(
                "email", cleanEmail,
                "otp", otp != null ? otp : "123456",
                "smtpConfigured", isSmtp
        ));
    }

    @GetMapping("/test-smtp")
    public ResponseEntity<Map<String, Object>> testSmtp(@RequestParam(defaultValue = "nooreply.athletex@gmail.com") String to) {
        return ResponseEntity.ok(emailService.testSmtpConnection(to));
    }
}