package com.athletex.backend.controller;

import com.athletex.backend.dto.ConversationSummaryDto;
import com.athletex.backend.dto.SendMessageRequest;
import com.athletex.backend.model.ChatMessage;
import com.athletex.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    private String resolveUserId(String explicitUserId) {
        if (explicitUserId != null && !explicitUserId.trim().isEmpty() && !"null".equalsIgnoreCase(explicitUserId) && !"undefined".equalsIgnoreCase(explicitUserId)) {
            return explicitUserId;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }

    // POST /api/chat/messages
    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody SendMessageRequest request, @RequestParam(required = false) String userId) {
        String senderId = resolveUserId(userId);
        if (senderId == null) {
            return ResponseEntity.badRequest().build();
        }
        ChatMessage message = chatService.sendMessage(senderId, request);
        return ResponseEntity.ok(message);
    }

    // GET /api/chat/conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryDto>> getConversations(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ConversationSummaryDto> conversations = chatService.getConversationsForUser(uid);
        return ResponseEntity.ok(conversations);
    }

    // GET /api/chat/messages/{otherUserId}
    @GetMapping("/messages/{otherUserId}")
    public ResponseEntity<List<ChatMessage>> getMessagesWithUser(
            @PathVariable String otherUserId,
            @RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid == null) {
            return ResponseEntity.ok(List.of());
        }
        List<ChatMessage> messages = chatService.getConversationMessages(uid, otherUserId);
        return ResponseEntity.ok(messages);
    }

    // PUT /api/chat/read/{otherUserId}
    @PutMapping("/read/{otherUserId}")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable String otherUserId,
            @RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        if (uid != null) {
            chatService.markAsRead(uid, otherUserId);
        }
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // GET /api/chat/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam(required = false) String userId) {
        String uid = resolveUserId(userId);
        long count = uid != null ? chatService.getTotalUnreadCount(uid) : 0;
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
