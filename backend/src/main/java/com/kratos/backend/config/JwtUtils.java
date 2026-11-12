package com.kratos.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${kratos.jwt.secret}")
    private String jwtSecret;

    @Value("${kratos.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${kratos.jwt.issuer:kratos-panel}")
    private String jwtIssuer;

    private SecretKey signingKey;

    @PostConstruct
    public void initKey() {
        byte[] secretBytes = jwtSecret == null
                ? new byte[0]
                : jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 64) {
            throw new IllegalStateException(
                    "kratos.jwt.secret doit contenir au moins 64 octets pour une clé HS512"
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
    }

    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .issuer(jwtIssuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        try {
            return Long.valueOf(claims.getSubject());
        } catch (NumberFormatException | NullPointerException exception) {
            throw new JwtException("Le sujet du token ne contient pas un ID utilisateur valide", exception);
        }
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .requireIssuer(jwtIssuer)
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}