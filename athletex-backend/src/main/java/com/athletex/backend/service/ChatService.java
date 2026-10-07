package com.athletex.backend.service;

import com.athletex.backend.dto.ConversationSummaryDto;
import com.athletex.backend.dto.SendMessageRequest;
import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.ChatMessage;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.ChatMessageRepository;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final NotificationService notificationService;

    public String generateConversationId(String userId1, String userId2) {
        if (userId1 == null || userId2 == null) return "";
        return userId1.compareTo(userId2) < 0 ? userId1 + "_" + userId2 : userId2 + "_" + userId1;
    }

    public ChatMessage sendMessage(String senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender user not found"));
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient user not found"));

        String conversationId = generateConversationId(senderId, request.getRecipientId());

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .senderName(sender.getFullName() != null ? sender.getFullName() : "User")
                .senderRole(sender.getRole() != null ? sender.getRole().name() : "USER")
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "TEXT")
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // Send push notification to recipient
        try {
            String link = "COACH".equalsIgnoreCase(recipient.getRole().name()) ? "/coach/chat" : "/chat";
            String title = "Message from " + message.getSenderName();
            notificationService.sendNotification(recipient.getId(), title, request.getContent(), "CHAT", link);
        } catch (Exception e) {
            // Ignore notification failure if any
        }

        return saved;
    }

    public List<ChatMessage> getConversationMessages(String currentUserId, String otherUserId) {
        String conversationId = generateConversationId(currentUserId, otherUserId);
        
        // Mark received messages as read
        List<ChatMessage> unread = chatMessageRepository.findByRecipientIdAndSenderIdAndIsReadFalse(currentUserId, otherUserId);
        if (!unread.isEmpty()) {
            for (ChatMessage msg : unread) {
                msg.setIsRead(true);
            }
            chatMessageRepository.saveAll(unread);
        }

        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    public List<ConversationSummaryDto> getConversationsForUser(String currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> contactUserIds = new LinkedHashSet<>();

        // 1. Add roster assignment contacts
        if ("COACH".equalsIgnoreCase(currentUser.getRole().name())) {
            List<CoachAthleteAssignment> assignments = assignmentRepository.findByCoachIdAndStatus(currentUserId, AssignmentStatus.ACTIVE);
            for (CoachAthleteAssignment a : assignments) {
                contactUserIds.add(a.getAthleteId());
            }
        } else if ("ATHLETE".equalsIgnoreCase(currentUser.getRole().name())) {
            Optional<CoachAthleteAssignment> assignment = assignmentRepository.findByAthleteIdAndStatus(currentUserId, AssignmentStatus.ACTIVE);
            assignment.ifPresent(a -> contactUserIds.add(a.getCoachId()));
        }

        // 2. Also add any users with past message exchanges
        List<ChatMessage> allMessages = chatMessageRepository.findBySenderIdOrRecipientIdOrderByTimestampDesc(currentUserId, currentUserId);
        for (ChatMessage msg : allMessages) {
            if (!msg.getSenderId().equals(currentUserId)) {
                contactUserIds.add(msg.getSenderId());
            }
            if (!msg.getRecipientId().equals(currentUserId)) {
                contactUserIds.add(msg.getRecipientId());
            }
        }

        List<ConversationSummaryDto> summaries = new ArrayList<>();

        for (String otherId : contactUserIds) {
            Optional<User> otherUserOpt = userRepository.findById(otherId);
            if (otherUserOpt.isEmpty()) continue;
            User otherUser = otherUserOpt.get();

            String conversationId = generateConversationId(currentUserId, otherId);
            List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId);

            String lastMsgText = "No messages yet";
            LocalDateTime lastMsgTime = null;
            if (!messages.isEmpty()) {
                ChatMessage lastMsg = messages.get(messages.size() - 1);
                lastMsgText = lastMsg.getContent();
                lastMsgTime = lastMsg.getTimestamp();
            }

            long unreadCount = chatMessageRepository.countByRecipientIdAndSenderIdAndIsReadFalse(currentUserId, otherId);

            summaries.add(ConversationSummaryDto.builder()
                    .conversationId(conversationId)
                    .otherUserId(otherUser.getId())
                    .otherUserName(otherUser.getFullName() != null ? otherUser.getFullName() : "User")
                    .otherUserRole(otherUser.getRole() != null ? otherUser.getRole().name() : "USER")
                    .otherUserSport(otherUser.getSport() != null ? otherUser.getSport() : "Athlete")
                    .lastMessage(lastMsgText)
                    .lastMessageTime(lastMsgTime)
                    .unreadCount(unreadCount)
                    .isOnline(true)
                    .build());
        }

        // Sort by last message time descending
        summaries.sort((a, b) -> {
            if (a.getLastMessageTime() == null && b.getLastMessageTime() == null) return 0;
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        });

        return summaries;
    }

    public void markAsRead(String currentUserId, String otherUserId) {
        List<ChatMessage> unread = chatMessageRepository.findByRecipientIdAndSenderIdAndIsReadFalse(currentUserId, otherUserId);
        if (!unread.isEmpty()) {
            for (ChatMessage msg : unread) {
                msg.setIsRead(true);
            }
            chatMessageRepository.saveAll(unread);
        }
    }

    public long getTotalUnreadCount(String currentUserId) {
        return chatMessageRepository.countByRecipientIdAndIsReadFalse(currentUserId);
    }
}
