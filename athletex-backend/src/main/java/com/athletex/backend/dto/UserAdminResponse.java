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
public class UserAdminResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String sport;
    private String city;
    private String state;
    private String country;
    private String profileImage;
    private long activeAssignmentsCount;
}
