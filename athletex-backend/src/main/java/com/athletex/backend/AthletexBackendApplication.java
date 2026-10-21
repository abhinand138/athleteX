package com.athletex.backend;

import com.athletex.backend.model.AssignmentStatus;
import com.athletex.backend.model.CoachAthleteAssignment;
import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.model.VerificationStatus;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
@EnableScheduling
public class AthletexBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AthletexBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDefaultUsers(
			UserRepository userRepository,
			CoachAthleteAssignmentRepository assignmentRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Admin Account
			String adminEmail = "admin@athletex.com";
			User admin = userRepository.findByEmail(adminEmail).orElse(null);
			if (admin == null) {
				admin = User.builder()
						.fullName("System Administrator")
						.email(adminEmail)
						.phone("+1000000000")
						.password(passwordEncoder.encode("admin123"))
						.role(Role.ADMIN)
						.isVerified(true)
						.verificationStatus(VerificationStatus.APPROVED)
						.build();
				userRepository.save(admin);
				System.out.println("✅ Default Admin User created: " + adminEmail + " / admin123");
			}

			// 2. Demo Coach Account
			String coachEmail = "coach@athletex.com";
			User coach = userRepository.findByEmail(coachEmail).orElse(null);
			if (coach == null) {
				coach = User.builder()
						.fullName("Coach Marcus Vance")
						.email(coachEmail)
						.phone("+15552345678")
						.password(passwordEncoder.encode("Coach@123"))
						.role(Role.COACH)
						.sport("Track & Field")
						.position("Head Performance Director")
						.city("Austin")
						.state("TX")
						.country("USA")
						.bio("Olympic trials finalist specializing in sprint mechanics, top-end velocity, and combine assessment.")
						.isVerified(true)
						.verificationStatus(VerificationStatus.APPROVED)
						.build();
				coach = userRepository.save(coach);
				System.out.println("✅ Demo Coach User created: " + coachEmail + " / Coach@123");
			} else {
				// Ensure password and role are active
				coach.setRole(Role.COACH);
				coach.setPassword(passwordEncoder.encode("Coach@123"));
				coach.setVerified(true);
				coach.setVerificationStatus(VerificationStatus.APPROVED);
				coach = userRepository.save(coach);
			}

			// 3. Demo Athlete Account
			String athleteEmail = "athlete@athletex.com";
			User athlete = userRepository.findByEmail(athleteEmail).orElse(null);
			if (athlete == null) {
				athlete = User.builder()
						.fullName("Alex Rivera")
						.email(athleteEmail)
						.phone("+15559876543")
						.password(passwordEncoder.encode("Athlete@123"))
						.role(Role.ATHLETE)
						.sport("Football / Track")
						.position("Wide Receiver")
						.age(21)
						.gender("Male")
						.height(185.0)
						.weight(88.0)
						.city("Austin")
						.state("TX")
						.country("USA")
						.bio("Collegiate wide receiver aiming for the national combine.")
						.isVerified(true)
						.verificationStatus(VerificationStatus.APPROVED)
						.build();
				athlete = userRepository.save(athlete);
				System.out.println("✅ Demo Athlete User created: " + athleteEmail + " / Athlete@123");
			} else {
				athlete.setRole(Role.ATHLETE);
				athlete.setPassword(passwordEncoder.encode("Athlete@123"));
				athlete.setVerified(true);
				athlete = userRepository.save(athlete);
			}

			// 4. Ensure Active Coach-Athlete Assignment
			if (coach != null && athlete != null) {
				boolean assigned = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coach.getId(), athlete.getId(), AssignmentStatus.ACTIVE);
				if (!assigned) {
					CoachAthleteAssignment assignment = CoachAthleteAssignment.builder()
							.coachId(coach.getId())
							.athleteId(athlete.getId())
							.assignedAt(LocalDateTime.now())
							.status(AssignmentStatus.ACTIVE)
							.build();
					assignmentRepository.save(assignment);
					System.out.println("✅ Assigned " + athleteEmail + " to " + coachEmail);
				}
			}
		};
	}
}
