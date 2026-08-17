package com.athletex.backend.repository;

import com.athletex.backend.model.ScoutView;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ScoutViewRepository
        extends MongoRepository<ScoutView, String> {

    List<ScoutView> findByAthleteIdOrderByViewedAtDesc(
            String athleteId
    );

    long countByAthleteId(String athleteId);

    long countByAthleteIdAndScoutId(
            String athleteId,
            String scoutId
    );
}