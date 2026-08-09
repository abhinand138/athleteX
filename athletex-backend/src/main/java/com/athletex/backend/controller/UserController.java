package com.athletex.backend.controller;

import com.athletex.backend.dto.ProfileResponse;
import com.athletex.backend.dto.UpdateProfileRequest;
import com.athletex.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile/{id}")
    public ProfileResponse getProfile(@PathVariable String id) {
        return userService.getProfile(id);
    }

    @PutMapping("/profile/{id}")
    public String updateProfile(
            @PathVariable String id,
            @RequestBody UpdateProfileRequest request) {

        return userService.updateProfile(id, request);
    }
}