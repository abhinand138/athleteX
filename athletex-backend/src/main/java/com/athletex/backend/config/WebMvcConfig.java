package com.athletex.backend.config;

import com.athletex.backend.util.FileStorageUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        List<Path> candidateDirs = FileStorageUtil.getAllCandidateUploadDirectories();
        List<String> locations = new ArrayList<>();

        for (Path dir : candidateDirs) {
            String uri = dir.toUri().toString();
            locations.add(uri.endsWith("/") ? uri : uri + "/");
        }

        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]));
    }
}
