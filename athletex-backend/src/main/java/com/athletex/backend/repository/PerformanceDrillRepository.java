package com.athletex.backend.repository;

import com.athletex.backend.model.PerformanceDrill;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PerformanceDrillRepository extends MongoRepository<PerformanceDrill, String> {

    List<PerformanceDrill> findByUserIdOrderByRecordedAtDesc(String userId);

    List<PerformanceDrill> findByUserIdAndDrillCodeOrderByRecordedAtDesc(String userId, String drillCode);

    List<PerformanceDrill> findByUserIdAndDrillCodeOrderByRecordedAtAsc(String userId, String drillCode);

    List<PerformanceDrill> findByUserIdAndIsPersonalRecordTrue(String userId);

    Optional<PerformanceDrill> findByIdAndUserId(String id, String userId);

    long countByUserId(String userId);
}
