package com.athletex.backend.service;

import com.athletex.backend.dto.notification.AnnouncementRequest;
import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.model.Notification;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;

    public Notification sendNotification(String userId, String title, String message, String type, String link) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    public Notification sendNotificationWithRef(String userId, String title, String message, String type, String link, String referenceType, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            if (userId == null || userId.equals(notification.getUserId())) {
                notification.setIsRead(true);
                return notificationRepository.save(notification);
            }
        }
        return notification;
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            if (userId == null || userId.equals(notification.getUserId())) {
                notificationRepository.delete(notification);
            }
        }
    }

    public void clearAllNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
    }

    public void broadcastAnnouncement(AnnouncementRequest request) {
        List<String> targetUserIds = new ArrayList<>();

        if (request.isSendToAllRoster()) {
            List<CoachAthleteAssignment> assignments =
                    assignmentRepository.findByCoachIdAndStatus(request.getCoachId(), AssignmentStatus.ACTIVE);
            for (CoachAthleteAssignment assignment : assignments) {
                targetUserIds.add(assignment.getAthleteId());
            }
        } else if (request.getRecipientIds() != null) {
            targetUserIds.addAll(request.getRecipientIds());
        }

        List<Notification> notifications = new ArrayList<>();
        for (String recipientId : targetUserIds) {
            notifications.add(Notification.builder()
                    .userId(recipientId)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type("COACH_ANNOUNCEMENT")
                    .link("/athlete/notifications")
                    .referenceType("ANNOUNCEMENT")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    public void notifyAchievementUnlocked(Object achievement, Object coachObj, Object athleteObj) {
        // Helper method for legacy achievement events
    }

    public void notifyPerformanceUpdated(Object performance, Object athlete, String updatedBy) {
        // Helper method for legacy performance events
    }

    public void notifyTrainingCancelled(Object training, String coachId, String coachName, String athleteName) {
        // Helper method for legacy training cancellation events
    }

    public void notifyTrainingCompleted(Object training, String userId, String coachName, String athleteName) {
        // Helper method for legacy training completion events
    }
}
