package com.athletex.backend;

import com.athletex.backend.model.Role;
import com.athletex.backend.model.User;
import com.athletex.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AthletexBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AthletexBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String adminEmail = "admin@athletex.com";
			User existingAdmin = userRepository.findByEmail(adminEmail).orElse(null);

			if (existingAdmin == null) {
				User admin = User.builder()
						.fullName("System Administrator")
						.email(adminEmail)
						.phone("+1000000000")
						.password(passwordEncoder.encode("admin123"))
						.role(Role.ADMIN)
						.build();
				userRepository.save(admin);
				System.out.println("✅ Default Admin User created: " + adminEmail + " / admin123");
			} else if (existingAdmin.getRole() != Role.ADMIN) {
				existingAdmin.setRole(Role.ADMIN);
				userRepository.save(existingAdmin);
				System.out.println("✅ Updated user " + adminEmail + " to ADMIN role.");
			}
		};
	}
}
