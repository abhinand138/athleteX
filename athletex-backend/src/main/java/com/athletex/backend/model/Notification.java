package com.athletex.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String recipientId;
    private String recipientName;

    private String senderId;
    private String senderName;

    private NotificationType type;
    private String title;
    private String message;

    private String referenceId;
    private String referenceType; // TRAINING, ACHIEVEMENT, PERFORMANCE, ANNOUNCEMENT, REPORT, SYSTEM

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
