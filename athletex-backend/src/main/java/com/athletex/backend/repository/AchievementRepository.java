package com.athletex.backend.repository;

import com.athletex.backend.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AchievementRepository
        extends MongoRepository<Achievement, String> {

    List<Achievement> findByUserIdOrderByDateDesc(String userId);

    long countByUserId(String userId);
}