package com.athletex.backend.repository;

import com.athletex.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    List<Notification> findByUserIdAndIsReadFalse(String userId);

    void deleteByUserId(String userId);
}
