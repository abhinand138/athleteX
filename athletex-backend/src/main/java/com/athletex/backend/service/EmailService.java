package com.athletex.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@athletex.com}")
    private String fromEmail;

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("AthleteX - Your Verification Code");
            message.setText("Your verification code is: " + otp + "\n\nPlease use this code to verify your account.");
            
            javaMailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            // Since we might not have a real SMTP set up locally, let's log the OTP clearly so the developer can use it
            log.warn("=== DEVELOPMENT MODE OTP ===");
            log.warn("Email: {}, OTP: {}", to, otp);
            log.warn("=============================");
        }
    }
}
