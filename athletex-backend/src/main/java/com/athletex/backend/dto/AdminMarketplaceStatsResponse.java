package com.athletex.backend.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMarketplaceStatsResponse {

    private Double grossMerchandiseVolume; // GMV
    private Double platformRevenue; // Total platform fees collected
    private Double coachPayoutsTotal; // Total earnings for coaches
    private Long totalTransactions;
    private Long activeSubscribersCount;
    private List<PaymentReceiptResponse> recentTransactions;
}
