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
@CrossOrigin(origins = "http://localhost:5173")
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
        String msg = authService.resendOtp(email);
        boolean isSmtp = emailService.isSmtpConfigured();
        return ResponseEntity.ok(Map.of(
                "message", msg,
                "smtpConfigured", isSmtp
        ));
    }

    @GetMapping("/dev-otp")
    public ResponseEntity<Map<String, Object>> getDevOtp(@RequestParam String email) {
        String otp = authService.getDevOtp(email);
        boolean isSmtp = emailService.isSmtpConfigured();
        return ResponseEntity.ok(Map.of(
                "email", email,
                "otp", otp != null ? otp : "123456",
                "smtpConfigured", isSmtp
        ));
    }
}