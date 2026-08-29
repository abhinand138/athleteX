package com.athletex.backend.service;

import com.athletex.backend.dto.notification.AnnouncementRequest;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.NotificationRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final ActivityService activityService;

    // =========================================================================
    // CORE CRUD OPERATIONS
    // =========================================================================

    public Notification createNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (userId != null && !userId.isBlank() && !notification.getRecipientId().equals(userId)) {
            throw new SecurityException("Unauthorized: Cannot modify another user's notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        if (unread != null && !unread.isEmpty()) {
            for (Notification n : unread) {
                n.setRead(true);
            }
            notificationRepository.saveAll(unread);
        }
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (userId != null && !userId.isBlank() && !notification.getRecipientId().equals(userId)) {
            throw new SecurityException("Unauthorized: Cannot delete another user's notification");
        }

        notificationRepository.deleteById(notificationId);
    }

    public void clearAllNotifications(String userId) {
        notificationRepository.deleteByRecipientId(userId);
    }

    // =========================================================================
    // AUTOMATIC EVENT TRIGGERS
    // =========================================================================

    public void notifyTrainingAssigned(Training training, User coach, User athlete) {
        String dateStr = training.getDate() != null
                ? training.getDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "Upcoming";
        String timeStr = training.getTime() != null ? " at " + training.getTime() : "";

        Notification notification = Notification.builder()
                .recipientId(athlete.getId())
                .recipientName(athlete.getFullName())
                .senderId(coach.getId())
                .senderName(coach.getFullName())
                .type(NotificationType.TRAINING_ASSIGNED)
                .title("New Training Assigned")
                .message(String.format("Coach %s scheduled a %s workout: '%s' for %s%s.",
                        coach.getFullName(),
                        training.getCategory() != null ? training.getCategory() : "Training",
                        training.getTitle(),
                        dateStr,
                        timeStr))
                .referenceId(training.getId())
                .referenceType("TRAINING")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        createNotification(notification);
    }

    public void notifyTrainingCompleted(Training training, String completedByUserId, String coachName, String athleteName) {
        boolean completedByAthlete = completedByUserId != null && completedByUserId.equals(training.getAthleteId());

        // If completed by athlete -> notify coach
        if (completedByAthlete) {
            Notification notification = Notification.builder()
                    .recipientId(training.getCoachId())
                    .recipientName(coachName)
                    .senderId(training.getAthleteId())
                    .senderName(athleteName)
                    .type(NotificationType.TRAINING_COMPLETED)
                    .title("Training Completed")
                    .message(String.format("%s marked '%s' as completed.", athleteName, training.getTitle()))
                    .referenceId(training.getId())
                    .referenceType("TRAINING")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            createNotification(notification);
        } else {
            // Completed by coach -> notify athlete
            Notification notification = Notification.builder()
                    .recipientId(training.getAthleteId())
                    .recipientName(athleteName)
                    .senderId(training.getCoachId())
                    .senderName(coachName)
                    .type(NotificationType.TRAINING_COMPLETED)
                    .title("Training Completed")
                    .message(String.format("Coach %s verified completion for '%s'.", coachName, training.getTitle()))
                    .referenceId(training.getId())
                    .referenceType("TRAINING")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            createNotification(notification);
        }
    }

    public void notifyTrainingCancelled(Training training, String cancelledByUserId, String coachName, String athleteName) {
        String dateStr = training.getDate() != null
                ? training.getDate().format(DateTimeFormatter.ofPattern("MMM dd")) : "";

        Notification notification = Notification.builder()
                .recipientId(training.getAthleteId())
                .recipientName(athleteName)
                .senderId(training.getCoachId())
                .senderName(coachName)
                .type(NotificationType.TRAINING_CANCELLED)
                .title("Training Cancelled")
                .message(String.format("The scheduled session '%s' (%s) was cancelled by Coach %s.",
                        training.getTitle(), dateStr, coachName))
                .referenceId(training.getId())
                .referenceType("TRAINING")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        createNotification(notification);
    }

    public void notifyAchievementUnlocked(Achievement achievement, User coach, User athlete) {
        String coachName = coach != null ? coach.getFullName() : "Coach";
        Notification notification = Notification.builder()
                .recipientId(athlete.getId())
                .recipientName(athlete.getFullName())
                .senderId(coach != null ? coach.getId() : null)
                .senderName(coachName)
                .type(NotificationType.ACHIEVEMENT_UNLOCKED)
                .title("🏆 New Achievement Unlocked")
                .message(String.format("Congratulations! Coach %s awarded you the achievement: '%s' (%s).",
                        coachName, achievement.getTitle(),
                        achievement.getCategory() != null ? achievement.getCategory() : "Milestone"))
                .referenceId(achievement.getId())
                .referenceType("ACHIEVEMENT")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        createNotification(notification);
    }

    public void notifyPerformanceUpdated(Performance performance, User athlete, String updatedByCoachName) {
        Notification notification = Notification.builder()
                .recipientId(athlete.getId())
                .recipientName(athlete.getFullName())
                .senderId(null)
                .senderName(updatedByCoachName != null ? updatedByCoachName : "System")
                .type(NotificationType.PERFORMANCE_UPDATED)
                .title("Performance Metrics Updated")
                .message(String.format("Your performance assessment has been updated (Overall Score: %s%%).",
                        performance.getOverallScore() != null ? performance.getOverallScore() : 0.0))
                .referenceId(performance.getId())
                .referenceType("PERFORMANCE")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        createNotification(notification);
    }

    // =========================================================================
    // COACH ANNOUNCEMENT BROADCASTER
    // =========================================================================

    public List<Notification> sendAnnouncement(AnnouncementRequest request) {
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: Only coaches can broadcast announcements");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Announcement title is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("Announcement message is required");
        }

        List<CoachAthleteAssignment> activeAssignments = assignmentRepository.findByCoachIdAndStatus(
                coach.getId(), AssignmentStatus.ACTIVE
        );

        Set<String> validAthleteIds = activeAssignments.stream()
                .map(CoachAthleteAssignment::getAthleteId)
                .collect(Collectors.toSet());

        List<String> targetRecipientIds = new ArrayList<>();

        if (request.isSendToAllRoster()) {
            targetRecipientIds.addAll(validAthleteIds);
        } else if (request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()) {
            for (String aId : request.getRecipientIds()) {
                if (!validAthleteIds.contains(aId)) {
                    throw new SecurityException("Access Denied: Athlete is not in your active roster: " + aId);
                }
                targetRecipientIds.add(aId);
            }
        } else {
            throw new IllegalArgumentException("Please select at least one recipient or choose entire roster.");
        }

        List<Notification> createdNotifications = new ArrayList<>();

        for (String athleteId : targetRecipientIds) {
            User athlete = userRepository.findById(athleteId).orElse(null);
            if (athlete != null) {
                Notification n = Notification.builder()
                        .recipientId(athlete.getId())
                        .recipientName(athlete.getFullName())
                        .senderId(coach.getId())
                        .senderName(coach.getFullName())
                        .type(NotificationType.COACH_ANNOUNCEMENT)
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .referenceId(coach.getId())
                        .referenceType("ANNOUNCEMENT")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();

                createdNotifications.add(createNotification(n));

                activityService.createActivity(
                        athlete.getId(),
                        "coach_announcement",
                        "Coach Announcement",
                        request.getTitle() + " - " + coach.getFullName(),
                        "📢"
                );
            }
        }

        return createdNotifications;
    }
}
