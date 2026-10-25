package com.athletex.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "pdf", "mp4", "mov"
    );

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided or file is empty"));
        }

        if (file.getSize() > 15 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds maximum allowed limit of 15MB"));
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "proof.jpg");
        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalFilename.substring(dotIdx + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file extension. Allowed: JPG, PNG, WEBP, PDF, MP4"));
        }

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String safeName = UUID.randomUUID().toString().substring(0, 12) + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path targetLocation = uploadDir.resolve(safeName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileType = "IMAGE";
            if ("pdf".equals(extension)) {
                fileType = "DOCUMENT";
            } else if ("mp4".equals(extension) || "mov".equals(extension)) {
                fileType = "VIDEO";
            }

            Map<String, Object> response = new HashMap<>();
            response.put("url", "/api/uploads/" + safeName);
            response.put("fileName", safeName);
            response.put("originalName", originalFilename);
            response.put("fileType", fileType);
            response.put("size", file.getSize());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to store uploaded file: " + e.getMessage()));
        }
    }
}
