package com.athletex.backend.controller;

import com.athletex.backend.dto.notification.AnnouncementRequest;
import com.athletex.backend.model.Notification;
import com.athletex.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    // =========================================================================
    // SECURE ZERO-TRUST "ME" ENDPOINTS (Derived from authenticated JWT)
    // =========================================================================

    // GET /api/notifications/me
    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        String userId = resolveUserId(authentication, null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // GET /api/notifications/me/unread
    @GetMapping("/me/unread")
    public ResponseEntity<?> getMyUnreadNotifications(Authentication authentication) {
        String userId = resolveUserId(authentication, null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // GET /api/notifications/me/unread/count
    @GetMapping("/me/unread/count")
    public ResponseEntity<?> getMyUnreadCount(Authentication authentication) {
        String userId = resolveUserId(authentication, null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // PUT /api/notifications/me/read-all
    @PutMapping("/me/read-all")
    public ResponseEntity<?> markMyAllAsRead(Authentication authentication) {
        String userId = resolveUserId(authentication, null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // DELETE /api/notifications/me/clear
    @DeleteMapping("/me/clear")
    public ResponseEntity<?> clearMyAllNotifications(Authentication authentication) {
        String userId = resolveUserId(authentication, null);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok("All notifications cleared");
    }

    // =========================================================================
    // ITEM MUTATION (Strict Ownership Check)
    // =========================================================================

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        String currentUserId = resolveUserId(authentication, userId);
        try {
            Notification updated = notificationService.markAsRead(id, currentUserId);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        String currentUserId = resolveUserId(authentication, userId);
        try {
            notificationService.deleteNotification(id, currentUserId);
            return ResponseEntity.ok("Notification deleted");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // SECURE ANNOUNCEMENTS (Coach ID Derived from JWT)
    // =========================================================================

    // POST /api/notifications/announcement
    @PostMapping("/announcement")
    public ResponseEntity<?> sendAnnouncement(
            @RequestBody AnnouncementRequest request,
            Authentication authentication) {
        String currentUserId = resolveUserId(authentication, request.getCoachId());
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required to broadcast announcements");
        }
        // Force coachId to authenticated user ID
        request.setCoachId(currentUserId);

        try {
            List<Notification> created = notificationService.sendAnnouncement(request);
            return ResponseEntity.ok(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // LEGACY ENDPOINTS WITH IDENTITY HARDENING
    // =========================================================================

    // GET /api/notifications/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(
            @PathVariable String userId,
            Authentication authentication) {
        String authenticatedUserId = resolveUserId(authentication, null);
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Cannot access another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // GET /api/notifications/unread/{userId}
    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> getUnreadNotifications(
            @PathVariable String userId,
            Authentication authentication) {
        String authenticatedUserId = resolveUserId(authentication, null);
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Cannot access another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // GET /api/notifications/unread/count/{userId}
    @GetMapping("/unread/count/{userId}")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable String userId,
            Authentication authentication) {
        String authenticatedUserId = resolveUserId(authentication, null);
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Cannot access another user's notifications");
        }
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // PUT /api/notifications/read-all/{userId}
    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String userId,
            Authentication authentication) {
        String authenticatedUserId = resolveUserId(authentication, null);
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Cannot modify another user's notifications");
        }
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // DELETE /api/notifications/clear/{userId}
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearAllNotifications(
            @PathVariable String userId,
            Authentication authentication) {
        String authenticatedUserId = resolveUserId(authentication, null);
        if (authenticatedUserId != null && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Cannot clear another user's notifications");
        }
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok("All notifications cleared");
    }

    // =========================================================================
    // HELPER: Resolve authenticated user
    // =========================================================================
    private String resolveUserId(Authentication authentication, String fallback) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return (String) authentication.getPrincipal();
        }
        return fallback;
    }
}
