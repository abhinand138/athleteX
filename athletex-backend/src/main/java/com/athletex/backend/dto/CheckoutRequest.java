package com.athletex.backend.dto;

import com.athletex.backend.model.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Coach ID is required")
    private String coachId;

    private String athleteId; // Optional: extracted from JWT, or provided in payload

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @Builder.Default
    private String paymentMethod = "SANDBOX_CARD"; // "SANDBOX_CARD", "STRIPE_CHECKOUT"

    private String cardNumber;
    private String cardholderName;
    private String expiry;
    private String cvv;

    private String notes;
}
