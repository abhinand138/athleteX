package com.athletex.backend.service;

import com.athletex.backend.model.WellnessCheckin;
import com.athletex.backend.repository.WellnessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WellnessService {

    private final WellnessRepository wellnessRepository;
    private final ActivityService activityService;

    public WellnessCheckin submitCheckin(String userId, Integer sleep, Integer soreness, Integer energy, String notes) {
        LocalDate today = LocalDate.now();

        int sleepVal = (sleep != null && sleep >= 1 && sleep <= 5) ? sleep : 3;
        int sorenessVal = (soreness != null && soreness >= 1 && soreness <= 5) ? soreness : 3;
        int energyVal = (energy != null && energy >= 1 && energy <= 5) ? energy : 3;

        // Calculate readiness percentage (20% to 100%)
        int readiness = (sleepVal * 7) + (energyVal * 7) + ((6 - sorenessVal) * 6);
        readiness = Math.min(100, Math.max(20, readiness));

        WellnessCheckin checkin = wellnessRepository.findByUserIdAndDate(userId, today)
                .orElse(WellnessCheckin.builder()
                        .userId(userId)
                        .date(today)
                        .createdAt(LocalDateTime.now())
                        .build());

        checkin.setSleepQuality(sleepVal);
        checkin.setMuscleSoreness(sorenessVal);
        checkin.setEnergyLevel(energyVal);
        checkin.setReadinessScore(readiness);
        checkin.setNotes(notes != null ? notes.trim() : "");

        WellnessCheckin saved = wellnessRepository.save(checkin);

        try {
            activityService.createActivity(
                    userId,
                    "wellness",
                    "Daily Readiness Logged",
                    "Logged " + readiness + "% readiness for today's training.",
                    "⚡"
            );
        } catch (Exception ignored) {}

        return saved;
    }

    public Optional<WellnessCheckin> getTodayCheckin(String userId) {
        return wellnessRepository.findByUserIdAndDate(userId, LocalDate.now());
    }

    public List<WellnessCheckin> getRecentCheckins(String userId) {
        return wellnessRepository.findByUserIdOrderByDateDesc(userId);
    }
}
