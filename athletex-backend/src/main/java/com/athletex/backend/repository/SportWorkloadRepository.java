package com.athletex.backend.repository;

import com.athletex.backend.model.SportWorkloadLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SportWorkloadRepository extends MongoRepository<SportWorkloadLog, String> {

    List<SportWorkloadLog> findByUserIdOrderByDateDesc(String userId);

    List<SportWorkloadLog> findByUserIdAndSportOrderByDateDesc(String userId, String sport);

    List<SportWorkloadLog> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDate start, LocalDate end);
}
