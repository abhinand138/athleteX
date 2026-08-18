package com.athletex.backend.repository;

import com.athletex.backend.model.Training;
import com.athletex.backend.model.TrainingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRepository extends MongoRepository<Training, String> {

    List<Training> findByAthleteIdAndStatusOrderByDateAscTimeAsc(String athleteId, TrainingStatus status);

    List<Training> findByCoachIdOrderByDateDescTimeDesc(String coachId);

    List<Training> findByCoachIdOrderByDateAscTimeAsc(String coachId);

    List<Training> findByAthleteIdOrderByDateDescTimeDesc(String athleteId);

    long countByAthleteId(String athleteId);

    long countByAthleteIdAndStatus(String athleteId, TrainingStatus status);

    long countByCoachIdAndStatus(String coachId, TrainingStatus status);
}
