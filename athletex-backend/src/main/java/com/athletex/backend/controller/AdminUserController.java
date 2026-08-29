package com.athletex.backend.controller;

import com.athletex.backend.dto.AdminStatsResponse;
import com.athletex.backend.dto.CoachAthleteResponse;
import com.athletex.backend.dto.UserAdminResponse;
import com.athletex.backend.model.Role;
import com.athletex.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminUserService.getAdminStats());
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role) {
        return ResponseEntity.ok(adminUserService.getAllUsers(search, role));
    }

    // PUT /api/admin/users/{userId}/role
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        try {
            String roleStr = body.get("role");
            if (roleStr == null || roleStr.isBlank()) {
                return ResponseEntity.badRequest().body("Role is required");
            }
            Role newRole = Role.valueOf(roleStr.toUpperCase());
            UserAdminResponse updated = adminUserService.updateUserRole(userId, newRole);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/admin/assignments
    @GetMapping("/assignments")
    public ResponseEntity<List<CoachAthleteResponse>> getAllRosterAssignments() {
        return ResponseEntity.ok(adminUserService.getAllRosterAssignments());
    }
}
