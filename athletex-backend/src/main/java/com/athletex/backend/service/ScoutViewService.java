package com.athletex.backend.service;

import com.athletex.backend.model.ScoutView;
import com.athletex.backend.repository.ScoutViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoutViewService {

    private final ScoutViewRepository scoutViewRepository;

    /*
     * RECORD PROFILE VIEW
     */
    public ScoutView recordView(
            String athleteId,
            String scoutId
    ) {

        ScoutView scoutView = ScoutView.builder()
                .athleteId(athleteId)
                .scoutId(scoutId)
                .viewedAt(LocalDateTime.now())
                .build();

        return scoutViewRepository.save(scoutView);
    }

    /*
     * GET TOTAL PROFILE VIEWS
     */
    public long getViewCount(String athleteId) {

        return scoutViewRepository
                .countByAthleteId(athleteId);
    }

    /*
     * GET VIEW HISTORY
     */
    public List<ScoutView> getViews(String athleteId) {

        return scoutViewRepository
                .findByAthleteIdOrderByViewedAtDesc(athleteId);
    }
}