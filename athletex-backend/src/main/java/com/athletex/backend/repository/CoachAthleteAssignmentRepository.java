package com.athletex.backend.repository;

import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachAthleteAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CoachAthleteAssignmentRepository extends MongoRepository<CoachAthleteAssignment, String> {

    List<CoachAthleteAssignment> findByCoachIdAndStatus(String coachId, AssignmentStatus status);

    Optional<CoachAthleteAssignment> findByAthleteIdAndStatus(String athleteId, AssignmentStatus status);

    long countByCoachIdAndStatus(String coachId, AssignmentStatus status);

    boolean existsByCoachIdAndAthleteIdAndStatus(String coachId, String athleteId, AssignmentStatus status);
}
