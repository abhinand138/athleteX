package com.athletex.backend.dto;

import com.athletex.backend.model.PaymentStatus;
import com.athletex.backend.model.PaymentType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptResponse {

    private String transactionId;
    private String receiptNumber;

    private String athleteId;
    private String athleteName;

    private String coachId;
    private String coachName;

    private Double amount;
    private Double platformFee;
    private Double coachEarning;

    private String currency;
    private PaymentStatus status;
    private PaymentType paymentType;
    private String paymentMethod;
    private String gatewayReferenceId;

    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    private boolean assignmentActivated;
    private String message;
}
