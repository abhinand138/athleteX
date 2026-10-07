package com.athletex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummaryDto {

    private String conversationId;

    private String otherUserId;

    private String otherUserName;

    private String otherUserRole; // ATHLETE or COACH

    private String otherUserSport;

    private String lastMessage;

    private LocalDateTime lastMessageTime;

    private long unreadCount;

    private boolean isOnline;
}
