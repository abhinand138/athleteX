package com.athletex.backend.service;

import com.athletex.backend.model.Notification;
import com.athletex.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

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

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
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
