package com.athletex.backend.service;

import com.athletex.backend.dto.ConversationSummaryDto;
import com.athletex.backend.dto.SendMessageRequest;
import com.athletex.backend.model.ChatMessage;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.ChatMessageRepository;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoachAthleteAssignmentRepository assignmentRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ChatService chatService;

    private User athlete;
    private User coach;

    @BeforeEach
    void setUp() {
        athlete = User.builder()
                .id("athlete_1")
                .fullName("John Doe")
                .email("athlete@test.com")
                .role(Role.ATHLETE)
                .sport("Track & Field")
                .build();

        coach = User.builder()
                .id("coach_1")
                .fullName("Coach Mike")
                .email("coach@test.com")
                .role(Role.COACH)
                .build();
    }

    @Test
    @DisplayName("Should generate standardized conversation ID regardless of user order")
    void testGenerateConversationId() {
        String id1 = chatService.generateConversationId("userA", "userB");
        String id2 = chatService.generateConversationId("userB", "userA");

        assertEquals("userA_userB", id1);
        assertEquals("userA_userB", id2);
    }

    @Test
    @DisplayName("Should send message successfully and persist message")
    void sendMessage_Success() {
        SendMessageRequest request = SendMessageRequest.builder()
                .recipientId("coach_1")
                .content("Hello Coach, ready for today's workout!")
                .build();

        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach_1")).thenReturn(Optional.of(coach));

        ChatMessage mockSaved = ChatMessage.builder()
                .id("msg_100")
                .conversationId("athlete_1_coach_1")
                .senderId("athlete_1")
                .senderName("John Doe")
                .senderRole("ATHLETE")
                .recipientId("coach_1")
                .content("Hello Coach, ready for today's workout!")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(mockSaved);

        ChatMessage result = chatService.sendMessage("athlete_1", request);

        assertNotNull(result);
        assertEquals("athlete_1", result.getSenderId());
        assertEquals("coach_1", result.getRecipientId());
        assertEquals("Hello Coach, ready for today's workout!", result.getContent());
        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("Should retrieve conversation messages and mark unread messages as read")
    void getConversationMessages_Success() {
        ChatMessage unreadMsg = ChatMessage.builder()
                .id("msg_1")
                .conversationId("athlete_1_coach_1")
                .senderId("coach_1")
                .recipientId("athlete_1")
                .content("Great job on your sprint!")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();

        when(chatMessageRepository.findByRecipientIdAndSenderIdAndIsReadFalse("athlete_1", "coach_1"))
                .thenReturn(List.of(unreadMsg));
        when(chatMessageRepository.findByConversationIdOrderByTimestampAsc("athlete_1_coach_1"))
                .thenReturn(List.of(unreadMsg));

        List<ChatMessage> messages = chatService.getConversationMessages("athlete_1", "coach_1");

        assertNotNull(messages);
        assertEquals(1, messages.size());
        assertTrue(unreadMsg.getIsRead());
        verify(chatMessageRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Should get conversation summaries for user")
    void getConversationsForUser_Success() {
        when(userRepository.findById("athlete_1")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach_1")).thenReturn(Optional.of(coach));
        when(assignmentRepository.findByAthleteIdAndStatus(eq("athlete_1"), any()))
                .thenReturn(Optional.empty());
        
        ChatMessage msg = ChatMessage.builder()
                .id("msg_1")
                .conversationId("athlete_1_coach_1")
                .senderId("coach_1")
                .recipientId("athlete_1")
                .content("Workout schedule updated")
                .timestamp(LocalDateTime.now())
                .build();

        when(chatMessageRepository.findBySenderIdOrRecipientIdOrderByTimestampDesc("athlete_1", "athlete_1"))
                .thenReturn(List.of(msg));
        when(chatMessageRepository.findByConversationIdOrderByTimestampAsc("athlete_1_coach_1"))
                .thenReturn(List.of(msg));
        when(chatMessageRepository.countByRecipientIdAndSenderIdAndIsReadFalse("athlete_1", "coach_1"))
                .thenReturn(1L);

        List<ConversationSummaryDto> summaries = chatService.getConversationsForUser("athlete_1");

        assertNotNull(summaries);
        assertEquals(1, summaries.size());
        assertEquals("coach_1", summaries.get(0).getOtherUserId());
        assertEquals("Coach Mike", summaries.get(0).getOtherUserName());
        assertEquals("Workout schedule updated", summaries.get(0).getLastMessage());
        assertEquals(1L, summaries.get(0).getUnreadCount());
    }
}
