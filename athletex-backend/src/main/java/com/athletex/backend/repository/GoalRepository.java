package com.athletex.backend.repository;

import com.athletex.backend.model.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends MongoRepository<Goal, String> {

    List<Goal> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Goal> findByUserIdAndCompleted(String userId, boolean completed);
}
