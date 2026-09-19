package com.athletex.backend.controller;

import com.athletex.backend.dto.*;
import com.athletex.backend.model.AdminAuditLog;
import com.athletex.backend.model.Role;
import com.athletex.backend.service.AdminAuditLogService;
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
    private final AdminAuditLogService adminAuditLogService;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminUserService.getAdminStats());
    }

    // GET /api/admin/audit-logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLog>> getAuditLogs(
            @RequestParam(required = false) String action) {
        if (action != null && !action.isBlank()) {
            return ResponseEntity.ok(adminAuditLogService.getLogsByAction(action.trim()));
        }
        return ResponseEntity.ok(adminAuditLogService.getAllLogs());
    }

    // DELETE /api/admin/audit-logs
    @DeleteMapping("/audit-logs")
    public ResponseEntity<String> clearAuditLogs() {
        adminAuditLogService.clearAllLogs();
        return ResponseEntity.ok("Audit log history cleared successfully.");
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

    // GET /api/admin/coaches/pending
    @GetMapping("/coaches/pending")
    public ResponseEntity<List<UserAdminResponse>> getPendingCoaches() {
        return ResponseEntity.ok(adminUserService.getPendingCoaches());
    }

    // PUT /api/admin/coaches/{coachId}/verify
    @PutMapping("/coaches/{coachId}/verify")
    public ResponseEntity<?> verifyCoach(
            @PathVariable String coachId,
            @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            if (statusStr == null || statusStr.isBlank()) {
                return ResponseEntity.badRequest().body("Status is required (APPROVED or REJECTED)");
            }
            com.athletex.backend.model.VerificationStatus status = com.athletex.backend.model.VerificationStatus.valueOf(statusStr.toUpperCase());
            UserAdminResponse updated = adminUserService.verifyCoach(coachId, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid verification status specified");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/admin/coaches/batch-verify
    @PutMapping("/coaches/batch-verify")
    public ResponseEntity<?> batchVerifyCoaches(@RequestBody Map<String, Object> body) {
        try {
            List<String> coachIds = (List<String>) body.get("coachIds");
            String statusStr = (String) body.get("status");
            if (coachIds == null || coachIds.isEmpty() || statusStr == null || statusStr.isBlank()) {
                return ResponseEntity.badRequest().body("Coach IDs list and status are required.");
            }
            com.athletex.backend.model.VerificationStatus status = com.athletex.backend.model.VerificationStatus.valueOf(statusStr.toUpperCase());
            List<UserAdminResponse> updated = adminUserService.batchVerifyCoaches(coachIds, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/admin/export/users
    @GetMapping(value = "/export/users", produces = "text/csv")
    public ResponseEntity<String> exportUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role) {
        String csvData = adminUserService.exportUsersCsv(search, role);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"athletex_users_export.csv\"")
                .body(csvData);
    }

    // GET /api/admin/export/rosters
    @GetMapping(value = "/export/rosters", produces = "text/csv")
    public ResponseEntity<String> exportRosters() {
        String csvData = adminUserService.exportRostersCsv();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"athletex_rosters_export.csv\"")
                .body(csvData);
    }

    // GET /api/admin/export/audit-logs
    @GetMapping(value = "/export/audit-logs", produces = "text/csv")
    public ResponseEntity<String> exportAuditLogs() {
        String csvData = adminAuditLogService.exportAuditLogsCsv();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"athletex_audit_logs_export.csv\"")
                .body(csvData);
    }
}
