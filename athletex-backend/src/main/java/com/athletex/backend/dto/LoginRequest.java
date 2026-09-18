package com.athletex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Full Name or Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}