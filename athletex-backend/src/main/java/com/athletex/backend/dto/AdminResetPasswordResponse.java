package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResetPasswordResponse {
    private String message;
    private String temporaryPassword;
    private String userId;
    private String userEmail;
    private String userName;
}
