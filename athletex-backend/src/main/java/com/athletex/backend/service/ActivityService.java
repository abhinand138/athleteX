package com.athletex.backend.service;

import com.athletex.backend.model.Activity;
import com.athletex.backend.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public Activity createActivity(String userId, String type, String title, String description, String icon) {
        Activity activity = Activity.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .description(description)
                .timestamp(LocalDateTime.now())
                .icon(icon)
                .build();
                
        return activityRepository.save(activity);
    }

    public List<Activity> getUserActivities(String userId) {
        return activityRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
