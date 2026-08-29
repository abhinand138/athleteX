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

    private String userId; // Recipient User ID

    private String title;

    private String message;

    private String type; // VERIFICATION, TRAINING, SYSTEM

    private Boolean isRead;

    private String link; // Optional route link (e.g. /achievements)

    private LocalDateTime createdAt;
}
