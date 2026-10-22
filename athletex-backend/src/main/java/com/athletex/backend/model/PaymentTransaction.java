package com.athletex.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    private String id;

    private String receiptNumber;

    private String athleteId;
    private String athleteName;
    private String athleteEmail;

    private String coachId;
    private String coachName;
    private String coachEmail;

    private Double amount;
    private Double platformFee;
    private Double coachEarning;

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private PaymentType paymentType;

    private String paymentMethod; // e.g. "SANDBOX_CARD", "STRIPE_CHECKOUT"

    private String gatewayReferenceId; // External / Mock txn ID

    private String notes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
