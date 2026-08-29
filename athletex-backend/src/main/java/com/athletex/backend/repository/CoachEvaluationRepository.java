package com.athletex.backend.repository;

import com.athletex.backend.model.CoachEvaluation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoachEvaluationRepository extends MongoRepository<CoachEvaluation, String> {

    Optional<CoachEvaluation> findFirstByCoachIdAndAthleteIdOrderByCreatedAtDesc(String coachId, String athleteId);

    Optional<CoachEvaluation> findFirstByAthleteIdOrderByCreatedAtDesc(String athleteId);

    List<CoachEvaluation> findByAthleteIdOrderByCreatedAtDesc(String athleteId);
}
