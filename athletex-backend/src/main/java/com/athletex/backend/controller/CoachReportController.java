package com.athletex.backend.controller;

import com.athletex.backend.dto.reports.AchievementReportDto;
import com.athletex.backend.dto.reports.IndividualAthleteReportDto;
import com.athletex.backend.dto.reports.TeamReportDto;
import com.athletex.backend.dto.reports.TrainingReportDto;
import com.athletex.backend.service.CoachReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/coach/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoachReportController {

    private final CoachReportService coachReportService;

    // GET /api/coach/reports/athlete/{coachId}/{athleteId}
    @GetMapping("/athlete/{coachId}/{athleteId}")
    public ResponseEntity<?> getIndividualAthleteReport(
            @PathVariable String coachId,
            @PathVariable String athleteId,
            @RequestParam(required = false, defaultValue = "30d") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            IndividualAthleteReportDto report = coachReportService.getIndividualAthleteReport(coachId, athleteId, range, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/reports/team/{coachId}
    @GetMapping("/team/{coachId}")
    public ResponseEntity<?> getTeamReport(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            TeamReportDto report = coachReportService.getTeamReport(coachId, range, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/reports/training/{coachId}
    @GetMapping("/training/{coachId}")
    public ResponseEntity<?> getTrainingReport(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            TrainingReportDto report = coachReportService.getTrainingReport(coachId, range, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/coach/reports/achievements/{coachId}
    @GetMapping("/achievements/{coachId}")
    public ResponseEntity<?> getAchievementReport(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            AchievementReportDto report = coachReportService.getAchievementReport(coachId, range, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================================================================
    // CSV EXPORT ENDPOINTS
    // =========================================================================

    @GetMapping(value = "/athlete/{coachId}/{athleteId}/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadAthleteCsv(
            @PathVariable String coachId,
            @PathVariable String athleteId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        try {
            String csv = coachReportService.generateAthleteCsv(coachId, athleteId, range);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"athlete-performance-report.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.getBytes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/team/{coachId}/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadTeamCsv(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        try {
            String csv = coachReportService.generateTeamCsv(coachId, range);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"team-performance-report.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.getBytes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/training/{coachId}/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadTrainingCsv(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        try {
            String csv = coachReportService.generateTrainingCsv(coachId, range);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"training-report.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.getBytes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/achievements/{coachId}/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadAchievementCsv(
            @PathVariable String coachId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        try {
            String csv = coachReportService.generateAchievementCsv(coachId, range);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"achievement-report.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv.getBytes());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
