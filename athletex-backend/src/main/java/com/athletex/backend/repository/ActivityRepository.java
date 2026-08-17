package com.athletex.backend.repository;

import com.athletex.backend.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserIdOrderByTimestampDesc(String userId);
}
