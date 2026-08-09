package com.athletex.backend.dto;

import com.athletex.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String message;

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
}