package com.athletex.backend.service;

import com.athletex.backend.dto.LoginRequest;
import com.athletex.backend.dto.LoginResponse;
import com.athletex.backend.dto.RegisterRequest;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.model.VerificationStatus;
import com.athletex.backend.repository.UserRepository;
import com.athletex.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        validRegisterRequest = RegisterRequest.builder()
                .fullName("John Athlete")
                .email("john@example.com")
                .password("Password123!")
                .phone("1234567890")
                .role(Role.ATHLETE)
                .build();

        mockUser = User.builder()
                .id("user_123")
                .fullName("John Athlete")
                .email("john@example.com")
                .password("$2a$10$hashedpassword")
                .role(Role.ATHLETE)
                .isVerified(true)
                .verificationStatus(VerificationStatus.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new athlete")
    void register_Success() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(emailService.generateOtp()).thenReturn("123456");
        when(passwordEncoder.encode("Password123!")).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        String result = authService.register(validRegisterRequest);

        assertEquals("Registration Successful.", result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should return error when registering with existing email")
    void register_DuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        String result = authService.register(validRegisterRequest);

        assertEquals("Email already exists", result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when password complexity is not met")
    void register_WeakPassword() {
        validRegisterRequest.setPassword("weak");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(validRegisterRequest);
        });

        assertTrue(exception.getMessage().contains("Password does not meet complexity requirements"));
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void login_Success() {
        LoginRequest loginRequest = new LoginRequest("john@example.com", "Password123!");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("Password123!", "$2a$10$hashedpassword")).thenReturn(true);
        when(jwtUtil.generateToken("user_123", "john@example.com", Role.ATHLETE)).thenReturn("mock.jwt.token");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("Login Successful", response.getMessage());
        assertEquals("user_123", response.getId());
        assertEquals("mock.jwt.token", response.getToken());
        verify(activityService, times(1)).createActivity(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when login email is not found")
    void login_UserNotFound() {
        LoginRequest loginRequest = new LoginRequest("nonexistent@example.com", "Password123!");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    @DisplayName("Should throw exception when password does not match")
    void login_InvalidPassword() {
        LoginRequest loginRequest = new LoginRequest("john@example.com", "WrongPassword!");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("WrongPassword!", "$2a$10$hashedpassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid password", exception.getMessage());
    }
}
