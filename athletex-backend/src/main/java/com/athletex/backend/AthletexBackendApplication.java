package com.athletex.backend;

import com.athletex.backend.dto.ai.ExerciseDetail;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.CoachAthleteAssignmentRepository;
import com.athletex.backend.repository.TrainingRepository;
import com.athletex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
			PasswordEncoder passwordEncoder,
			TrainingRepository trainingRepository) {
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
						.monthlyRate(4999.0)
						.consultationRate(1999.0)
						.currency("INR")
						.build();
				coach = userRepository.save(coach);
				System.out.println("✅ Demo Coach User created: " + coachEmail + " / Coach@123");
			} else {
				// Ensure role and rates are active in INR without overwriting custom password
				coach.setRole(Role.COACH);
				coach.setVerified(true);
				coach.setVerificationStatus(VerificationStatus.APPROVED);
				if (coach.getMonthlyRate() == null) coach.setMonthlyRate(4999.0);
				if (coach.getConsultationRate() == null) coach.setConsultationRate(1999.0);
				if (coach.getCurrency() == null) coach.setCurrency("INR");
				coach = userRepository.save(coach);
			}

			// Migrate all existing coach accounts to INR
			List<User> coachesInDb = userRepository.findByRole(Role.COACH);
			for (User c : coachesInDb) {
				boolean updated = false;
				if ("USD".equalsIgnoreCase(c.getCurrency()) || c.getCurrency() == null) {
					c.setCurrency("INR");
					updated = true;
				}
				if (c.getMonthlyRate() == null || c.getMonthlyRate() <= 200.0) {
					c.setMonthlyRate(4999.0);
					updated = true;
				}
				if (c.getConsultationRate() == null || c.getConsultationRate() <= 100.0) {
					c.setConsultationRate(1999.0);
					updated = true;
				}
				if (updated) {
					userRepository.save(c);
				}
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

				// Seed sample workouts if athlete has none
				if (trainingRepository.countByAthleteId(athlete.getId()) == 0) {
					// 1. Scheduled today
					Training t1 = Training.builder()
							.coachId(coach.getId())
							.athleteId(athlete.getId())
							.title("Sprint Acceleration & Explosive Starts")
							.category("SPEED")
							.description("Focus on acceleration mechanics, low drive angle, and high horizontal impulse.")
							.date(LocalDate.now())
							.time("10:00 AM")
							.status(TrainingStatus.SCHEDULED)
							.actualDurationMinutes(45)
							.exercises(List.of(
									ExerciseDetail.builder().name("Dynamic Leg Swings & High Knees").sets("2 Sets").repsOrDuration("30 sec per side").restInterval("30 sec").coachingNotes("Open hip flexors dynamic activation.").build(),
									ExerciseDetail.builder().name("Resisted Band 20m Acceleration Drive").sets("4 Sets").repsOrDuration("20 Meters Max Effort").restInterval("90 sec").coachingNotes("Stay low through 10m; drive knees forcefully.").build(),
									ExerciseDetail.builder().name("Flying 30m Speed Endurance").sets("3 Sets").repsOrDuration("30 Meters Flying").restInterval("120 sec").coachingNotes("Relax upper body and float over ground at top speed.").build()
							))
							.createdAt(LocalDateTime.now())
							.build();

					// 2. Scheduled tomorrow
					Training t2 = Training.builder()
							.coachId(coach.getId())
							.athleteId(athlete.getId())
							.title("Lower Body Power & Agility Shuttle")
							.category("AGILITY")
							.description("Multi-directional cutting, deceleration control, and reactive plyometrics.")
							.date(LocalDate.now().plusDays(1))
							.time("04:30 PM")
							.status(TrainingStatus.SCHEDULED)
							.actualDurationMinutes(50)
							.exercises(List.of(
									ExerciseDetail.builder().name("Pro Agility Shuttle 5-10-5").sets("4 Sets").repsOrDuration("Max Deceleration & Cut").restInterval("75 sec").coachingNotes("Drop hips low on turn; plant outside foot firmly.").build(),
									ExerciseDetail.builder().name("Trap-Bar Deadlifts").sets("4 Sets").repsOrDuration("5 Reps @ 80% 1RM").restInterval("90 sec").coachingNotes("Explosive hip drive, neutral spine.").build()
							))
							.createdAt(LocalDateTime.now())
							.build();

					// 3. Completed 2 days ago for ACWR baseline
					Training t3 = Training.builder()
							.coachId(coach.getId())
							.athleteId(athlete.getId())
							.title("Threshold Aerobic Conditioning")
							.category("ENDURANCE")
							.description("Tempo intervals for aerobic enzyme enhancement.")
							.date(LocalDate.now().minusDays(2))
							.time("08:00 AM")
							.status(TrainingStatus.COMPLETED)
							.actualDurationMinutes(45)
							.rpe(7)
							.athleteFeedback("Solid conditioning block; legs felt bouncy.")
							.completedAt(LocalDateTime.now().minusDays(2))
							.createdAt(LocalDateTime.now().minusDays(3))
							.build();

					trainingRepository.saveAll(List.of(t1, t2, t3));
					System.out.println("✅ Seeded demo workouts for " + athleteEmail);
				}
			}
		};
	}
}
