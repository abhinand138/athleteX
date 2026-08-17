package com.athletex.backend.repository;

import com.athletex.backend.model.Performance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PerformanceRepository extends MongoRepository<Performance, String> {

    Optional<Performance> findByUserId(String userId);
}