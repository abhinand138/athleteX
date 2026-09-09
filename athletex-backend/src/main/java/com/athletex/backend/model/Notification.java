package com.athletex.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    private String type; // VERIFICATION, TRAINING, SYSTEM, COACH_ANNOUNCEMENT, TRAINING_ASSIGNED, etc.

    @Builder.Default
    private Boolean isRead = false;

    private String link; // Optional route link (e.g. /achievements)

    private String referenceType; // TRAINING, ACHIEVEMENT, PERFORMANCE

    private String referenceId;

    private LocalDateTime createdAt;

    @JsonProperty("read")
    public Boolean getRead() {
        return isRead;
    }

    @JsonProperty("read")
    public void setRead(Boolean read) {
        this.isRead = read;
    }
}
