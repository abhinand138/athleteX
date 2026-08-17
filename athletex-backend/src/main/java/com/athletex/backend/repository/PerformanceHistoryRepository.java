package com.athletex.backend.repository;

import com.athletex.backend.model.PerformanceHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceHistoryRepository extends MongoRepository<PerformanceHistory, String> {
    List<PerformanceHistory> findByUserIdOrderByRecordedAtAsc(String userId);
}
