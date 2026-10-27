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
                .title(user.getTitle())
                .specialization(user.getSpecialization())
                .experienceYears(user.getExperienceYears())
                .certifications(user.getCertifications())
                .monthlyRate(user.getMonthlyRate())
                .consultationRate(user.getConsultationRate())
                .currency(user.getCurrency())
                .build();
    }

    // Update Profile
    public String updateProfile(String id, UpdateProfileRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getSport() != null) user.setSport(request.getSport());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getHeight() != null) user.setHeight(request.getHeight());
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());

        if (request.getTitle() != null) user.setTitle(request.getTitle());
        if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
        if (request.getExperienceYears() != null) user.setExperienceYears(request.getExperienceYears());
        if (request.getCertifications() != null) user.setCertifications(request.getCertifications());
        if (request.getMonthlyRate() != null) user.setMonthlyRate(request.getMonthlyRate());
        if (request.getConsultationRate() != null) user.setConsultationRate(request.getConsultationRate());
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) user.setCurrency(request.getCurrency());

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

    // Update Profile Image Only
    public String updateProfileImage(String id, String profileImage) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileImage(profileImage);
        userRepository.save(user);

        activityService.createActivity(
                user.getId(),
                "profile_update",
                "Profile Photo Updated",
                "You updated your profile picture.",
                "📸"
        );

        return "Profile photo updated successfully";
    }

    // Update Password
    public String updatePassword(String id, com.athletex.backend.dto.UpdatePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        boolean passwordMatches = false;
        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$") || user.getPassword().startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
        } else {
            passwordMatches = user.getPassword().equals(currentPassword);
        }

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid current password");
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