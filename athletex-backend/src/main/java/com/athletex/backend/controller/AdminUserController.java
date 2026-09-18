package com.athletex.backend.controller;

import com.athletex.backend.dto.*;
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

    // PUT /api/admin/users/{userId}
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUserDetails(
            @PathVariable String userId,
            @RequestBody AdminUserUpdateRequest request) {
        try {
            UserAdminResponse updated = adminUserService.updateUserDetails(userId, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    // GET /api/admin/rosters (Detailed admin view of active roster assignments)
    @GetMapping("/rosters")
    public ResponseEntity<List<AdminRosterResponse>> getDetailedRosterAssignments() {
        return ResponseEntity.ok(adminUserService.getDetailedRosterAssignments());
    }

    // GET /api/admin/assignments (Legacy list)
    @GetMapping("/assignments")
    public ResponseEntity<List<CoachAthleteResponse>> getAllRosterAssignments() {
        return ResponseEntity.ok(adminUserService.getAllRosterAssignments());
    }

    // POST /api/admin/assignments (Manual admin roster assignment)
    @PostMapping("/assignments")
    public ResponseEntity<?> createRosterAssignment(@RequestBody AdminCreateAssignmentRequest request) {
        try {
            AdminRosterResponse created = adminUserService.createRosterAssignment(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/admin/assignments/{assignmentId} (Terminate roster assignment)
    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<String> terminateRosterAssignment(@PathVariable String assignmentId) {
        try {
            String message = adminUserService.terminateRosterAssignment(assignmentId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/admin/users/last
    @DeleteMapping("/users/last")
    public ResponseEntity<String> deleteLastUser() {
        try {
            String message = adminUserService.deleteLastUser();
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/admin/users/{userId}
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        try {
            String message = adminUserService.deleteUser(userId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
