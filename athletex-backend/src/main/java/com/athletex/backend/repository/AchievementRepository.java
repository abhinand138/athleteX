package com.athletex.backend.repository;

import com.athletex.backend.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {

    List<Achievement> findByAthleteIdOrderByDateDesc(String athleteId);

    List<Achievement> findByUserIdOrderByDateDesc(String userId);

    List<Achievement> findByCoachIdOrderByDateDesc(String coachId);

    List<Achievement> findByAthleteIdInOrderByDateDesc(List<String> athleteIds);

    List<Achievement> findByUserIdInOrderByDateDesc(List<String> userIds);

    long countByAthleteId(String athleteId);

    long countByUserId(String userId);

    long countByCoachId(String coachId);
}