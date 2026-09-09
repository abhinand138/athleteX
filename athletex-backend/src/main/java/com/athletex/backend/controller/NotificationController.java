package com.athletex.backend.controller;

import com.athletex.backend.dto.notification.AnnouncementRequest;
import com.athletex.backend.model.Notification;
import com.athletex.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    private String resolveUserId(String explicitUserId) {
        if (explicitUserId != null && !explicitUserId.trim().isEmpty() && !"null".equalsIgnoreCase(explicitUserId) && !"undefined".equalsIgnoreCase(explicitUserId)) {
            return explicitUserId;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    // GET /api/notifications/me
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getCurrentUserNotifications(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(uid));
    }

    // GET /api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(uid));
    }

    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        long count = uid != null ? notificationService.getUnreadCount(uid) : 0;
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // GET /api/notifications/me/unread/count
    @GetMapping("/me/unread/count")
    public ResponseEntity<Map<String, Long>> getMeUnreadCount(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        long count = uid != null ? notificationService.getUnreadCount(uid) : 0;
        return ResponseEntity.ok(Map.of("unreadCount", count, "count", count));
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, @RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        Notification updated = notificationService.markAsRead(id, uid);
        return ResponseEntity.ok(updated);
    }

    // PUT /api/notifications/me/read-all
    @PutMapping("/me/read-all")
    public ResponseEntity<Map<String, String>> markMeAllAsRead(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid != null) {
            notificationService.markAllAsRead(uid);
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // PUT /api/notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid != null) {
            notificationService.markAllAsRead(uid);
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id, @RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        notificationService.deleteNotification(id, uid);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // DELETE /api/notifications/me/clear
    @DeleteMapping("/me/clear")
    public ResponseEntity<Map<String, String>> clearAllNotifications(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid != null) {
            notificationService.clearAllNotifications(uid);
        }
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    // POST /api/notifications/announcement
    @PostMapping("/announcement")
    public ResponseEntity<Map<String, String>> broadcastAnnouncement(@RequestBody AnnouncementRequest request) {
        notificationService.broadcastAnnouncement(request);
        return ResponseEntity.ok(Map.of("message", "Announcement sent successfully"));
    }
}
