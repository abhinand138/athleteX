package com.athletex.backend.service;

import com.athletex.backend.dto.ProfileResponse;
import com.athletex.backend.dto.UpdateProfileRequest;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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

        return "Profile Updated Successfully";
    }
}