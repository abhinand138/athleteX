package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String message;

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";

    public LoginResponse(String message, String id, String fullName, String email, String phone, Role role, String token) {
        this.message = message;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.token = token;
        this.tokenType = "Bearer";
    }
}