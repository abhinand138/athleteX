package com.athletex.backend.security;

import com.athletex.backend.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // 256-bit default fallback secret key (must be at least 32 bytes)
    private static final String DEFAULT_SECRET = "AthleteX_Super_Secure_Secret_Key_For_JWT_Auth_2026_MCA_Project_32Bytes!";
    private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000L; // 7 days in ms

    private final SecretKey secretKey;

    public JwtUtil(@Value("${athletex.jwt.secret:" + DEFAULT_SECRET + "}") String secret) {
        // Ensure key is long enough for HS256
        String keyStr = (secret == null || secret.length() < 32) ? DEFAULT_SECRET : secret;
        this.secretKey = Keys.hmacShaKeyFor(keyStr.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String userId, String email, Role role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role != null ? role.name() : "ATHLETE")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
