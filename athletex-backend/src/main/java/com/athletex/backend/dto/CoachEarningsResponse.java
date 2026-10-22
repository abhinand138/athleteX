package com.athletex.backend.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachEarningsResponse {

    private Double totalEarnings;
    private Double monthlyRecurringRevenue; // Estimated MRR from active athletes
    private Long activePaidAthletes;
    private Long totalTransactions;
    private Double platformFeePaidTotal;
    private String currency;
    private List<PaymentReceiptResponse> recentTransactions;
}
