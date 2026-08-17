package com.athletex.backend.service;
import com.athletex.backend.dto.LoginResponse;
import com.athletex.backend.dto.LoginRequest;
import com.athletex.backend.dto.RegisterRequest;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final PasswordEncoder passwordEncoder;

    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return "Registration Successful";
    }

    public LoginResponse login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

    if (user == null) {
        throw new RuntimeException("User not found");
    }

    boolean passwordMatches = false;

    // Check if the stored password is a BCrypt hash (starts with $2a$, $2b$, or $2y$)
    if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
        passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
    } else {
        // Plain text fallback and migration
        if (user.getPassword().equals(request.getPassword())) {
            passwordMatches = true;
            // Migrate password to BCrypt
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
        }
    }

    if (!passwordMatches) {
        throw new RuntimeException("Invalid password");
    }

    activityService.createActivity(
            user.getId(),
            "login",
            "Login Successful",
            "You logged into your account.",
            "🔐"
    );

    return new LoginResponse(
            "Login Successful",
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
    );
}
}