package com.athletex.backend.service;

import com.athletex.backend.dto.CoachEvaluationRequest;
import com.athletex.backend.dto.CoachEvaluationResponse;
import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachEvaluation;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.CoachEvaluationRepository;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CoachEvaluationService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final CoachEvaluationRepository evaluationRepository;

    public CoachEvaluationResponse saveOrUpdateEvaluation(String coachId, CoachEvaluationRequest request) {
        User coach = verifyCoach(coachId);

        String athleteId = request.getAthleteId();
        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                coachId, athleteId, AssignmentStatus.ACTIVE
        );

        if (!isAssigned) {
            throw new SecurityException("Access Denied: Athlete is not assigned to this coach");
        }

        Optional<CoachEvaluation> existingOpt = evaluationRepository
                .findFirstByCoachIdAndAthleteIdOrderByCreatedAtDesc(coachId, athleteId);

        CoachEvaluation evaluation;
        if (existingOpt.isPresent()) {
            evaluation = existingOpt.get();
            evaluation.setReadinessStatus(request.getReadinessStatus() != null ? request.getReadinessStatus() : "READY");
            evaluation.setCoachFeedback(request.getCoachFeedback());
            evaluation.setTargetSpeed(request.getTargetSpeed());
            evaluation.setTargetStrength(request.getTargetStrength());
            evaluation.setTargetEndurance(request.getTargetEndurance());
            evaluation.setTargetAgility(request.getTargetAgility());
            evaluation.setUpdatedAt(LocalDateTime.now());
        } else {
            evaluation = CoachEvaluation.builder()
                    .coachId(coachId)
                    .athleteId(athleteId)
                    .readinessStatus(request.getReadinessStatus() != null ? request.getReadinessStatus() : "READY")
                    .coachFeedback(request.getCoachFeedback())
                    .targetSpeed(request.getTargetSpeed())
                    .targetStrength(request.getTargetStrength())
                    .targetEndurance(request.getTargetEndurance())
                    .targetAgility(request.getTargetAgility())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        CoachEvaluation saved = evaluationRepository.save(evaluation);
        return mapToResponse(saved, coach.getFullName());
    }

    public CoachEvaluationResponse getLatestEvaluation(String coachId, String athleteId) {
        verifyCoach(coachId);

        boolean isAssigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                coachId, athleteId, AssignmentStatus.ACTIVE
        );

        if (!isAssigned) {
            throw new SecurityException("Access Denied: Athlete is not assigned to this coach");
        }

        User coach = userRepository.findById(coachId).orElse(null);
        String coachName = coach != null ? coach.getFullName() : "Coach";

        return evaluationRepository.findFirstByCoachIdAndAthleteIdOrderByCreatedAtDesc(coachId, athleteId)
                .map(e -> mapToResponse(e, coachName))
                .orElse(null);
    }

    private User verifyCoach(String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
        if (coach.getRole() != Role.COACH) {
            throw new RuntimeException("Access Denied: User is not a coach");
        }
        return coach;
    }

    private CoachEvaluationResponse mapToResponse(CoachEvaluation e, String coachName) {
        return CoachEvaluationResponse.builder()
                .id(e.getId())
                .coachId(e.getCoachId())
                .coachName(coachName)
                .athleteId(e.getAthleteId())
                .readinessStatus(e.getReadinessStatus())
                .coachFeedback(e.getCoachFeedback())
                .targetSpeed(e.getTargetSpeed())
                .targetStrength(e.getTargetStrength())
                .targetEndurance(e.getTargetEndurance())
                .targetAgility(e.getTargetAgility())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
