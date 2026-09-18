package com.athletex.backend.repository;

import com.athletex.backend.model.CoachConnectionRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CoachConnectionRequestRepository extends MongoRepository<CoachConnectionRequest, String> {

    List<CoachConnectionRequest> findByCoachId(String coachId);

    List<CoachConnectionRequest> findByAthleteId(String athleteId);

    boolean existsByAthleteIdAndCoachIdAndStatus(String athleteId, String coachId, String status);
}
