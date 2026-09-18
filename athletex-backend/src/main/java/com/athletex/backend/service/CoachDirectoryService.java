package com.athletex.backend.service;

import com.athletex.backend.dto.ConnectionRequestDto;
import com.athletex.backend.dto.CoachPublicProfileDto;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachDirectoryService {

    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final CoachConnectionRequestRepository connectionRequestRepository;
    private final NotificationRepository notificationRepository;

    public String sendConnectionRequest(ConnectionRequestDto dto) {
        if (dto.getAthleteId() == null || dto.getCoachId() == null) {
            throw new IllegalArgumentException("Athlete ID and Coach ID are required.");
        }

        User athlete = userRepository.findById(dto.getAthleteId()).orElse(null);
        String athleteName = athlete != null ? athlete.getFullName() : "An Athlete";
        String athleteSport = athlete != null && athlete.getSport() != null ? athlete.getSport() : "General Sports";

        User coach = userRepository.findById(dto.getCoachId()).orElse(null);
        String coachName = coach != null ? coach.getFullName() : "Coach";

        // Save Connection Request
        CoachConnectionRequest request = CoachConnectionRequest.builder()
                .athleteId(dto.getAthleteId())
                .athleteName(athleteName)
                .athleteSport(athleteSport)
                .coachId(dto.getCoachId())
                .coachName(coachName)
                .message(dto.getMessage() != null && !dto.getMessage().isBlank() ? dto.getMessage() : "Requesting coaching consultation and guidance.")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        CoachConnectionRequest savedRequest = connectionRequestRepository.save(request);

        // Trigger Notification for Coach
        Notification notification = Notification.builder()
                .userId(dto.getCoachId())
                .title("New Consultation Request from " + athleteName)
                .message(athleteName + " (" + athleteSport + ") sent a consultation request: \"" + request.getMessage() + "\"")
                .type("COACH_REQUEST")
                .link("/coach/notifications")
                .referenceType("COACH_REQUEST")
                .referenceId(savedRequest.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        return "Connection request successfully sent to " + coachName + "!";
    }

    public List<CoachConnectionRequest> getPendingRequestsForCoach(String coachId) {
        return connectionRequestRepository.findByCoachId(coachId).stream()
                .filter(req -> "PENDING".equalsIgnoreCase(req.getStatus()))
                .collect(Collectors.toList());
    }

    public String respondToRequest(String requestId, String status) {
        CoachConnectionRequest request = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"ACCEPTED".equalsIgnoreCase(status) && !"DECLINED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Status must be ACCEPTED or DECLINED");
        }

        request.setStatus(status.toUpperCase());
        connectionRequestRepository.save(request);

        if ("ACCEPTED".equalsIgnoreCase(status)) {
            // Check if active assignment exists
            boolean exists = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                    request.getCoachId(), request.getAthleteId(), AssignmentStatus.ACTIVE);

            if (!exists) {
                // Deactivate any existing assignment for this athlete
                Optional<CoachAthleteAssignment> existing = assignmentRepository.findByAthleteIdAndStatus(request.getAthleteId(), AssignmentStatus.ACTIVE);
                existing.ifPresent(a -> {
                    a.setStatus(AssignmentStatus.INACTIVE);
                    assignmentRepository.save(a);
                });

                // Create new active assignment
                CoachAthleteAssignment newAssignment = CoachAthleteAssignment.builder()
                        .coachId(request.getCoachId())
                        .athleteId(request.getAthleteId())
                        .assignedAt(LocalDateTime.now())
                        .status(AssignmentStatus.ACTIVE)
                        .build();

                assignmentRepository.save(newAssignment);
            }

            // Notify Athlete
            Notification notif = Notification.builder()
                    .userId(request.getAthleteId())
                    .title("Coach Connection Accepted!")
                    .message(request.getCoachName() + " has accepted your connection request. They are now your assigned primary coach.")
                    .type("COACH_ASSIGNED")
                    .link("/coaches")
                    .referenceType("COACH_ASSIGNMENT")
                    .referenceId(request.getId())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notif);
            return "Connection request accepted! Athlete " + request.getAthleteName() + " is now assigned to your roster.";

        } else {
            // Notify Athlete of declination
            Notification notif = Notification.builder()
                    .userId(request.getAthleteId())
                    .title("Connection Request Update")
                    .message(request.getCoachName() + " was unable to accept your connection request at this time.")
                    .type("COACH_DECLINED")
                    .link("/coaches")
                    .referenceType("COACH_ASSIGNMENT")
                    .referenceId(request.getId())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notif);
            return "Connection request declined.";
        }
    }

    public List<CoachPublicProfileDto> getCoachDirectory(String athleteId, String sport, String search) {
        List<User> coaches = userRepository.findByRole(Role.COACH);

        // Find active assigned coach ID for this athlete if athleteId is provided
        String activeAssignedCoachId = null;
        if (athleteId != null && !athleteId.isBlank()) {
            Optional<CoachAthleteAssignment> activeAssignment = assignmentRepository.findByAthleteIdAndStatus(athleteId, AssignmentStatus.ACTIVE);
            if (activeAssignment.isPresent()) {
                activeAssignedCoachId = activeAssignment.get().getCoachId();
            }
        }

        List<CoachPublicProfileDto> dtos = new ArrayList<>();

        for (User coach : coaches) {
            boolean isAssigned = (activeAssignedCoachId != null && activeAssignedCoachId.equals(coach.getId()));

            CoachPublicProfileDto dto = CoachPublicProfileDto.builder()
                    .id(coach.getId())
                    .fullName(coach.getFullName())
                    .email(coach.getEmail())
                    .phone(coach.getPhone())
                    .role(coach.getRole())
                    .sport(coach.getSport() != null ? coach.getSport() : "General Athletics")
                    .title(coach.getTitle() != null ? coach.getTitle() : "Head Performance Coach")
                    .specialization(coach.getSpecialization() != null ? coach.getSpecialization() : "Strength & Conditioning")
                    .experienceYears(coach.getExperienceYears() != null ? coach.getExperienceYears() : 5)
                    .certifications(coach.getCertifications() != null ? coach.getCertifications() : "NSCA-CSCS, USAW Level 2")
                    .city(coach.getCity() != null ? coach.getCity() : "Los Angeles")
                    .state(coach.getState() != null ? coach.getState() : "CA")
                    .country(coach.getCountry() != null ? coach.getCountry() : "USA")
                    .bio(coach.getBio() != null ? coach.getBio() : "Dedicated high-performance athletic coach focusing on bio-mechanics, sprint mechanics, and elite conditioning.")
                    .profileImage(coach.getProfileImage())
                    .isAssignedToAthlete(isAssigned)
                    .build();

            dtos.add(dto);
        }

        // If DB has no coaches yet, supply rich default coaches for demonstration
        if (dtos.isEmpty()) {
            dtos = getSampleCoaches(activeAssignedCoachId);
        }

        // Apply filtering if parameters provided
        return dtos.stream()
                .filter(dto -> (sport == null || sport.isBlank() || dto.getSport().equalsIgnoreCase(sport)))
                .filter(dto -> (search == null || search.isBlank() ||
                        dto.getFullName().toLowerCase().contains(search.toLowerCase()) ||
                        dto.getSpecialization().toLowerCase().contains(search.toLowerCase()) ||
                        dto.getSport().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    private List<CoachPublicProfileDto> getSampleCoaches(String activeCoachId) {
        List<CoachPublicProfileDto> sample = new ArrayList<>();

        sample.add(CoachPublicProfileDto.builder()
                .id("coach-1")
                .fullName("Marcus Vance")
                .email("marcus.vance@athletex.com")
                .phone("+1 (555) 234-5678")
                .role(Role.COACH)
                .sport("Track & Field")
                .title("Elite Performance Director")
                .specialization("Sprint Biomechanics & Acceleration")
                .experienceYears(12)
                .certifications("USATF Level 3, CSCS, EXOS High Performance")
                .city("Austin")
                .state("TX")
                .country("USA")
                .bio("Former Olympic trials finalist specializing in sprint mechanics, top-end velocity development, and neural recovery protocols.")
                .profileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400")
                .isAssignedToAthlete(activeCoachId == null || activeCoachId.equals("coach-1"))
                .build());

        sample.add(CoachPublicProfileDto.builder()
                .id("coach-2")
                .fullName("Dr. Elena Rostova")
                .email("elena.rostova@athletex.com")
                .phone("+1 (555) 876-5432")
                .role(Role.COACH)
                .sport("Basketball & High Explosiveness")
                .title("Senior Strength & Conditioning Specialist")
                .specialization("Vertical Jump & Plyometrics")
                .experienceYears(9)
                .certifications("Ph.D. Kinesiology, CSCS, FMS Level 2")
                .city("Chicago")
                .state("IL")
                .country("USA")
                .bio("Pioneer in reactive strength index (RSI) optimization, rate of force development (RFD), and lower limb injury prevention.")
                .profileImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400")
                .isAssignedToAthlete("coach-2".equals(activeCoachId))
                .build());

        sample.add(CoachPublicProfileDto.builder()
                .id("coach-3")
                .fullName("Coach David Miller")
                .email("david.miller@athletex.com")
                .phone("+1 (555) 345-6789")
                .role(Role.COACH)
                .sport("Endurance & Triathlon")
                .title("VO2 Max & Aerobic Capacity Lead")
                .specialization("Metabolic Efficiency & Heart Rate Dynamics")
                .experienceYears(15)
                .certifications("Ironman Certified Coach, USA Triathlon Level 2")
                .city("Boulder")
                .state("CO")
                .country("USA")
                .bio("Master of lactate threshold training, zone-based aerobic periodization, and altitude adaptation strategies.")
                .profileImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400")
                .isAssignedToAthlete("coach-3".equals(activeCoachId))
                .build());

        sample.add(CoachPublicProfileDto.builder()
                .id("coach-4")
                .fullName("Sarah Jenkins")
                .email("sarah.jenkins@athletex.com")
                .phone("+1 (555) 456-7890")
                .role(Role.COACH)
                .sport("Soccer & Football")
                .title("Agility & Movement Quality Coach")
                .specialization("Change of Direction & Deceleration Control")
                .experienceYears(8)
                .certifications("UEFA A License, NASM-PES, PRI Specialist")
                .city("Seattle")
                .state("WA")
                .country("USA")
                .bio("Expert in multi-planar movement efficiency, agility drills, and return-to-play ACL rehabilitation protocols.")
                .profileImage("https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400")
                .isAssignedToAthlete("coach-4".equals(activeCoachId))
                .build());

        return sample;
    }
}
