package com.athletex.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {

    private String orderId;
    private Long amountInPaise; // e.g. 499900
    private Double displayAmount; // e.g. 4999.00
    private String currency; // "INR"
    private String keyId; // "rzp_test_SonD1t5pBjHTet"

    private String coachId;
    private String coachName;
    private String athleteId;
    private String athleteName;
    private String athleteEmail;
    private String athletePhone;

    private String description;
    private Boolean simulated;
}
