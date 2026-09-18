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
public class AdminUserUpdateRequest {
    private String fullName;
    private String email;
    private String phone;
    private String sport;
    private String city;
    private Role role;
}
