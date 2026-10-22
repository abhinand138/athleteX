package com.athletex.backend.dto;

import com.athletex.backend.model.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateStatusRequest {
    private AccountStatus status;
    private String reason;
}
