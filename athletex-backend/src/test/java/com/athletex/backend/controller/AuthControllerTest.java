package com.athletex.backend.controller;

import com.athletex.backend.dto.LoginRequest;
import com.athletex.backend.dto.LoginResponse;
import com.athletex.backend.dto.RegisterRequest;
import com.athletex.backend.model.Role;
import com.athletex.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("POST /api/auth/register - Should return success message when registration details are valid")
    void register_Success() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .fullName("Test Athlete")
                .email("test@athletex.com")
                .password("Password123!")
                .phone("9876543210")
                .role(Role.ATHLETE)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn("Registration Successful.");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("Registration Successful."));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return LoginResponse token on valid credentials")
    void login_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@athletex.com", "Password123!");
        LoginResponse response = new LoginResponse(
                "Login Successful",
                "usr_999",
                "Test Athlete",
                "test@athletex.com",
                "9876543210",
                Role.ATHLETE,
                "jwt.token.string"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login Successful"))
                .andExpect(jsonPath("$.token").value("jwt.token.string"))
                .andExpect(jsonPath("$.role").value("ATHLETE"));
    }
}
