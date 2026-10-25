package com.athletex.backend.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @NotBlank
    private String fullName;

    @Email
    @org.springframework.data.mongodb.core.index.Indexed(unique = true)
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String password;

    private Role role;

    private String otp;

    @Builder.Default
    private boolean isVerified = false;

    // ==========================
    // Athlete Profile
    // ==========================

    private String sport;

    private String position;

    private Integer age;

    private String gender;

    private Double height;

    private Double weight;

    private String city;

    private String state;

    private String country;

    private String bio;

    private String profileImage;

    // ==========================
    // Coach Profile Additions
    // ==========================

    private String specialization;

    private Integer experienceYears;

    private String certifications;

    private String title;

    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.APPROVED;

    // ==========================
    // Governance & Security Status
    // ==========================

    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    private String suspensionReason;

    private LocalDateTime suspendedAt;

    public AccountStatus getAccountStatus() {
        return accountStatus != null ? accountStatus : AccountStatus.ACTIVE;
    }

    // ==========================
    // Coach Marketplace & Pricing
    // ==========================

    @Builder.Default
    private Double monthlyRate = 4999.0;

    @Builder.Default
    private Double consultationRate = 1999.0;

    @Builder.Default
    private String currency = "INR";

    private String payoutMethod;

    public Double getMonthlyRate() {
        return monthlyRate != null ? monthlyRate : 4999.0;
    }

    public Double getConsultationRate() {
        return consultationRate != null ? consultationRate : 1999.0;
    }

    public String getCurrency() {
        return currency != null && !currency.isBlank() ? currency : "INR";
    }
}