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
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    private String conversationId; // Sorted combination of user IDs (e.g., id1_id2)

    private String senderId;

    private String senderName;

    private String senderRole; // ATHLETE, COACH, ADMIN

    private String recipientId;

    private String content;

    @Builder.Default
    private String messageType = "TEXT"; // TEXT, SYSTEM, MEDIA, TRAINING_LINK

    private String attachmentUrl;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime timestamp;

    @JsonProperty("read")
    public Boolean getRead() {
        return isRead;
    }

    @JsonProperty("read")
    public void setRead(Boolean read) {
        this.isRead = read;
    }
}
