package com.athletex.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FileStorageUtil {

    private static final Logger log = LoggerFactory.getLogger(FileStorageUtil.class);
    private static volatile Path cachedUploadDir = null;

    private FileStorageUtil() {}

    /**
     * Resolves an active, guaranteed-writable directory for uploaded files.
     * Evaluates in priority order:
     * 1. UPLOAD_DIR environment variable or system property
     * 2. Local "./uploads" directory
     * 3. System temp directory ("athletex_uploads"), which is always writable on Linux/Docker/Windows
     */
    public static Path resolveUploadDirectory() {
        if (cachedUploadDir != null && isDirectoryWritable(cachedUploadDir)) {
            return cachedUploadDir;
        }

        synchronized (FileStorageUtil.class) {
            if (cachedUploadDir != null && isDirectoryWritable(cachedUploadDir)) {
                return cachedUploadDir;
            }

            // 1. Check UPLOAD_DIR environment variable
            String envDir = System.getenv("UPLOAD_DIR");
            if (envDir == null || envDir.isBlank()) {
                envDir = System.getProperty("upload.dir");
            }
            if (envDir != null && !envDir.isBlank()) {
                Path p = Paths.get(envDir.trim()).toAbsolutePath().normalize();
                if (ensureWritable(p)) {
                    log.info("Using configured UPLOAD_DIR: {}", p);
                    cachedUploadDir = p;
                    return p;
                }
            }

            // 2. Try default "./uploads" directory
            Path localDir = Paths.get("uploads").toAbsolutePath().normalize();
            if (ensureWritable(localDir)) {
                log.info("Using local uploads directory: {}", localDir);
                cachedUploadDir = localDir;
                return localDir;
            }

            // 3. Fallback to system temp directory (guaranteed writable by non-root users in Docker / Render)
            String tmpBase = System.getProperty("java.io.tmpdir", "/tmp");
            Path fallbackDir = Paths.get(tmpBase, "athletex_uploads").toAbsolutePath().normalize();
            if (ensureWritable(fallbackDir)) {
                log.warn("Default uploads directory not writable; using fallback temp directory: {}", fallbackDir);
                cachedUploadDir = fallbackDir;
                return fallbackDir;
            }

            // Ultimate fallback
            log.error("Unable to verify writable directory, defaulting to: {}", localDir);
            cachedUploadDir = localDir;
            return localDir;
        }
    }

    private static boolean ensureWritable(Path path) {
        try {
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
            return isDirectoryWritable(path);
        } catch (Exception e) {
            log.warn("Directory {} could not be created/verified: {}", path, e.getMessage());
            return false;
        }
    }

    private static boolean isDirectoryWritable(Path path) {
        try {
            if (!Files.exists(path) || !Files.isDirectory(path)) {
                return false;
            }
            // Check write permission via probe file to guarantee actual filesystem write access
            Path probe = path.resolve(".probe_" + System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString().substring(0, 8));
            Files.createFile(probe);
            Files.deleteIfExists(probe);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns list of all candidate upload directories for Spring WebMvc resource resolution.
     */
    public static List<Path> getAllCandidateUploadDirectories() {
        List<Path> candidates = new ArrayList<>();

        String envDir = System.getenv("UPLOAD_DIR");
        if (envDir == null || envDir.isBlank()) {
            envDir = System.getProperty("upload.dir");
        }
        if (envDir != null && !envDir.isBlank()) {
            candidates.add(Paths.get(envDir.trim()).toAbsolutePath().normalize());
        }

        candidates.add(Paths.get("uploads").toAbsolutePath().normalize());

        String tmpBase = System.getProperty("java.io.tmpdir", "/tmp");
        candidates.add(Paths.get(tmpBase, "athletex_uploads").toAbsolutePath().normalize());

        return Collections.unmodifiableList(candidates);
    }
}
