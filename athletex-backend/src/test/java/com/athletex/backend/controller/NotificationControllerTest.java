package com.athletex.backend.controller;

import com.athletex.backend.model.Notification;
import com.athletex.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private Notification mockNotification;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();

        mockNotification = Notification.builder()
                .id("notif_101")
                .userId("user_123")
                .title("New Workout Assigned")
                .message("Coach Alex assigned Morning Run.")
                .type("WORKOUT")
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("GET /api/notifications - Should return list of notifications for user")
    void getUserNotifications_Success() throws Exception {
        when(notificationService.getUserNotifications("user_123")).thenReturn(List.of(mockNotification));

        mockMvc.perform(get("/api/notifications")
                        .param("userId", "user_123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("notif_101"))
                .andExpect(jsonPath("$[0].title").value("New Workout Assigned"))
                .andExpect(jsonPath("$[0].message").value("Coach Alex assigned Morning Run."));

        verify(notificationService, times(1)).getUserNotifications("user_123");
    }

    @Test
    @DisplayName("GET /api/notifications/unread-count - Should return unread notification count")
    void getUnreadCount_Success() throws Exception {
        when(notificationService.getUnreadCount("user_123")).thenReturn(5L);

        mockMvc.perform(get("/api/notifications/unread-count")
                        .param("userId", "user_123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(5));
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read - Should mark notification as read")
    void markAsRead_Success() throws Exception {
        mockNotification.setRead(true);
        when(notificationService.markAsRead("notif_101", "user_123")).thenReturn(mockNotification);

        mockMvc.perform(put("/api/notifications/notif_101/read")
                        .param("userId", "user_123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }
}
