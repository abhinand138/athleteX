package com.athletex.backend.controller;

import com.athletex.backend.dto.ProfileResponse;
import com.athletex.backend.dto.UpdatePasswordRequest;
import com.athletex.backend.dto.UpdateProfileRequest;
import com.athletex.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile/{id}")
    public ProfileResponse getProfile(@PathVariable String id) {
        return userService.getProfile(id);
    }

    @PutMapping("/profile/{id}")
    public String updateProfile(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequest request) {

        return userService.updateProfile(id, request);
    }

    @PutMapping("/profile-image/{id}")
    public org.springframework.http.ResponseEntity<java.util.Map<String, String>> updateProfileImage(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> body) {
        String profileImage = body != null ? body.get("profileImage") : "";
        String message = userService.updateProfileImage(id, profileImage);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", message, "profileImage", profileImage != null ? profileImage : ""));
    }

    @PutMapping("/password/{id}")
    public String updatePassword(
            @PathVariable String id,
            @Valid @RequestBody UpdatePasswordRequest request) {

        return userService.updatePassword(id, request);
    }
}