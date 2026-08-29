package com.athletex.backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementRequest {

    private String coachId;
    private List<String> recipientIds;
    private boolean sendToAllRoster;
    private String title;
    private String message;
}
