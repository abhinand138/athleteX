package com.athletex.backend.repository;

import com.athletex.backend.model.WellnessCheckin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessRepository extends MongoRepository<WellnessCheckin, String> {

    Optional<WellnessCheckin> findByUserIdAndDate(String userId, LocalDate date);

    List<WellnessCheckin> findByUserIdOrderByDateDesc(String userId);
}
