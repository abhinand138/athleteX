package com.athletex.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${mail.from.email:${spring.mail.username:noreply@athletex.com}}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:smtp-relay.brevo.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public boolean isSmtpConfigured() {
        return mailPassword != null && !mailPassword.trim().isEmpty() && fromEmail != null && !fromEmail.trim().isEmpty();
    }

    public boolean isBrevoApiConfigured() {
        return brevoApiKey != null && !brevoApiKey.trim().isEmpty() && fromEmail != null && !fromEmail.trim().isEmpty();
    }

    public boolean isEmailConfigured() {
        return isBrevoApiConfigured() || isSmtpConfigured();
    }

    public boolean sendOtpEmail(String to, String otp) {
        String htmlBody = buildOtpHtml(otp);

        // 1. Try Brevo REST API first if configured (Port 443 HTTPS - cannot be blocked by cloud firewalls)
        if (isBrevoApiConfigured()) {
            boolean sent = sendViaBrevoApi(to, otp, htmlBody);
            if (sent) {
                return true;
            }
            log.warn("Brevo REST API dispatch failed. Attempting fallback to SMTP relay...");
        }

        // 2. Fallback to standard SMTP relay (Brevo or Gmail)
        if (!isSmtpConfigured()) {
            log.warn("=== [AthleteX Auth] EMAIL CREDENTIALS NOT CONFIGURED ===");
            log.warn("To send real emails to inboxes, configure BREVO_API_KEY, or MAIL_USERNAME and MAIL_PASSWORD in environment variables.");
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

    private boolean sendViaBrevoApi(String to, String otp, String htmlBody) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", Map.of("name", "AthleteX Sports Intelligence", "email", fromEmail));
            payload.put("to", List.of(Map.of("email", to)));
            payload.put("subject", "AthleteX - Your Verification Code [" + otp + "]");
            payload.put("htmlContent", htmlBody);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Verification OTP email successfully dispatched via Brevo REST API to {}", to);
                return true;
            } else {
                log.error("Brevo API error HTTP {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to send verification email via Brevo REST API to {}: {}", to, e.getMessage());
            return false;
        }
    }

    private String buildOtpHtml(String otp) {
        return """
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
    }

    public Map<String, Object> testSmtpConnection(String to) {
        return testSmtpConnection(to, null);
    }

    public Map<String, Object> testSmtpConnection(String to, String overrideFrom) {
        String effectiveFrom = (overrideFrom != null && !overrideFrom.isBlank()) ? overrideFrom.trim() : fromEmail;
        Map<String, Object> result = new HashMap<>();
        result.put("to", to);
        result.put("from", effectiveFrom);
        result.put("host", mailHost);
        result.put("port", mailPort);
        result.put("brevoApiKeyConfigured", isBrevoApiConfigured());
        result.put("smtpPasswordConfigured", isSmtpConfigured());

        if (isBrevoApiConfigured()) {
            result.put("provider", "Brevo REST API (HTTPS port 443)");
            try {
                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(10))
                        .build();

                Map<String, Object> payload = new HashMap<>();
                payload.put("sender", Map.of("name", "AthleteX Sports Intelligence", "email", effectiveFrom));
                payload.put("to", List.of(Map.of("email", to)));
                payload.put("subject", "AthleteX Diagnostic - Live Mail Test");
                payload.put("htmlContent", buildOtpHtml("888999"));

                String requestBody = objectMapper.writeValueAsString(payload);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                        .header("api-key", brevoApiKey.trim())
                        .header("Content-Type", "application/json")
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                        .timeout(Duration.ofSeconds(10))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

                result.put("brevoStatusCode", response.statusCode());
                result.put("brevoResponseBody", response.body());
                boolean ok = response.statusCode() >= 200 && response.statusCode() < 300;
                result.put("success", ok);
                result.put("message", ok ? "Dispatched to Brevo API. Status " + response.statusCode() + ": " + response.body() : "Brevo API returned error " + response.statusCode() + ": " + response.body());
                return result;
            } catch (Exception e) {
                result.put("success", false);
                result.put("errorMessage", e.getMessage());
                return result;
            }
        }

        result.put("provider", "SMTP Relay (" + mailHost + ":" + mailPort + ")");
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(effectiveFrom, "AthleteX Diagnostic Test");
            helper.setTo(to);
            helper.setSubject("AthleteX Diagnostic - Live Mail Test");
            helper.setText("This is a live diagnostic verification test message sent from AthleteX backend.", false);

            javaMailSender.send(mimeMessage);
            result.put("success", true);
            result.put("message", "Email successfully dispatched via SMTP to " + to);
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
