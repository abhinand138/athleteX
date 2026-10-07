package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private String recipientId;

    private String content;

    private String messageType; // Optional: TEXT, MEDIA, TRAINING_LINK

    private String attachmentUrl;
}
