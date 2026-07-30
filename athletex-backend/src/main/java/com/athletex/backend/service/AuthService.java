package com.athletex.backend.service;

import com.athletex.backend.dto.LoginRequest;
import com.athletex.backend.dto.RegisterRequest;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(request.getPassword())   // We'll encrypt this with BCrypt later
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return "Registration Successful";
    }

    public String login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

    if (user == null) {
        return "User not found";
    }

    if (!user.getPassword().equals(request.getPassword())) {
        return "Invalid password";
    }

    return "Login Successful";
}
}