package com.athletex.backend.dto;

import com.athletex.backend.model.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayVerifyRequest {

    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    private String razorpaySignature;

    @NotBlank(message = "Coach ID is required")
    private String coachId;

    private String athleteId;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @Builder.Default
    private String currency = "INR";

    private Double amount;
}
