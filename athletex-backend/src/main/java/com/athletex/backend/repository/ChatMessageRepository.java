package com.athletex.backend.repository;

import com.athletex.backend.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByConversationIdOrderByTimestampAsc(String conversationId);

    List<ChatMessage> findBySenderIdOrRecipientIdOrderByTimestampDesc(String senderId, String recipientId);

    long countByRecipientIdAndSenderIdAndIsReadFalse(String recipientId, String senderId);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    List<ChatMessage> findByRecipientIdAndSenderIdAndIsReadFalse(String recipientId, String senderId);
}
