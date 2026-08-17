package com.athletex.backend.service;

import com.athletex.backend.dto.ProfileResponse;
import com.athletex.backend.dto.UpdateProfileRequest;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final PasswordEncoder passwordEncoder;

    // Get Profile
    public ProfileResponse getProfile(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .sport(user.getSport())
                .position(user.getPosition())
                .age(user.getAge())
                .gender(user.getGender())
                .height(user.getHeight())
                .weight(user.getWeight())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .build();
    }

    // Update Profile
    public String updateProfile(String id, UpdateProfileRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setSport(request.getSport());
        user.setPosition(request.getPosition());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setHeight(request.getHeight());
        user.setWeight(request.getWeight());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setCountry(request.getCountry());
        user.setBio(request.getBio());
        user.setProfileImage(request.getProfileImage());

        userRepository.save(user);

        activityService.createActivity(
                user.getId(),
                "profile_update",
                "Profile Updated",
                "You updated your athlete profile.",
                "👤"
        );

        return "Profile Updated Successfully";
    }

    // Update Password
    public String updatePassword(String id, Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        boolean passwordMatches = false;
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
        } else {
            passwordMatches = user.getPassword().equals(currentPassword);
        }

        if (!passwordMatches) {
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        activityService.createActivity(
                user.getId(),
                "password_update",
                "Security Settings Updated",
                "You changed your password.",
                "🛡️"
        );

        return "Password Updated Successfully";
    }
}