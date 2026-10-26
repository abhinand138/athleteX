package com.athletex.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:noreply@athletex.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public boolean isSmtpConfigured() {
        return mailPassword != null && !mailPassword.trim().isEmpty() && fromEmail != null && !fromEmail.trim().isEmpty();
    }

    public boolean sendOtpEmail(String to, String otp) {
        if (!isSmtpConfigured()) {
            log.warn("=== [AthleteX Auth] SMTP CREDENTIALS NOT CONFIGURED ===");
            log.warn("To send real emails to inboxes, set spring.mail.username and spring.mail.password (Google App Password) in application.properties or environment variables.");
            log.warn("Target: {}, Active Verification OTP: {}", to, otp);
            log.warn("=========================================================");
            return false;
        }

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "AthleteX Sports Intelligence");
            helper.setTo(to);
            helper.setSubject("AthleteX - Your Verification Code [" + otp + "]");

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0c0e; color: #ffffff; padding: 20px; }
                    .card { max-width: 500px; margin: 0 auto; background-color: #141418; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
                    .logo { color: #f97316; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
                    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
                    .text { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
                    .otp-box { background: #1f1f23; border: 2px solid #f97316; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
                    .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #f97316; }
                    .footer { font-size: 11px; color: #71717a; text-align: center; border-top: 1px solid #27272a; padding-top: 16px; margin-top: 24px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo">⚡ ATHLETEX</div>
                    <div class="title">Recruit Identity Verification</div>
                    <div class="text">Welcome to AthleteX. Use the 6-digit verification code below to verify your account and initialize your sports performance profile:</div>
                    <div class="otp-box">
                      <div class="otp-code">%s</div>
                    </div>
                    <div class="text" style="font-size: 12px; color: #71717a;">This verification code is valid for 10 minutes. If you did not initiate this registration, please disregard this transmission.</div>
                    <div class="footer">AthleteX Sports Intelligence Platform &bull; Professional Athlete Performance System</div>
                  </div>
                </body>
                </html>
                """.formatted(otp);

            helper.setText(htmlBody, true);

            javaMailSender.send(mimeMessage);
            log.info("Verification OTP email successfully dispatched via SMTP to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send verification email via SMTP to {}: {}", to, e.getMessage());
            log.warn("=== DEVELOPMENT MODE OTP FALLBACK ===");
            log.warn("Email: {}, OTP: {}", to, otp);
            log.warn("=====================================");
            return false;
        }
    }

    public java.util.Map<String, Object> testSmtpConnection(String to) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("to", to);
        result.put("from", fromEmail);
        result.put("host", mailHost);
        result.put("port", mailPort);
        result.put("passwordConfigured", mailPassword != null && !mailPassword.isBlank());
        result.put("passwordLength", mailPassword != null ? mailPassword.length() : 0);

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail, "AthleteX Diagnostic Test");
            helper.setTo(to);
            helper.setSubject("AthleteX Diagnostic - Live SMTP Test");
            helper.setText("This is a live diagnostic verification test message sent from AthleteX backend.", false);

            javaMailSender.send(mimeMessage);
            result.put("success", true);
            result.put("message", "Email successfully dispatched to " + to);
            log.info("Diagnostic test email successfully sent to {}", to);
        } catch (Exception e) {
            result.put("success", false);
            result.put("errorClass", e.getClass().getName());
            result.put("errorMessage", e.getMessage());
            Throwable cause = e.getCause();
            if (cause != null) {
                result.put("rootCause", cause.getClass().getName() + ": " + cause.getMessage());
            }
            log.error("Diagnostic test email failed: {}", e.getMessage(), e);
        }
        return result;
    }
}
