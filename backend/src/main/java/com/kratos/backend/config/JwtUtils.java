package com.kratos.backend.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${kratos.jwt.secret:}")
    private String jwtSecretEnv;

    @Value("${kratos.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void initKey() {
        if (jwtSecretEnv != null && jwtSecretEnv.trim().length() >= 32) {

            this.signingKey = Keys.hmacShaKeyFor(jwtSecretEnv.getBytes(StandardCharsets.UTF_8));
            logger.info("JWT: Utilisation de la clé secrète fournie par l'environnement.");
        } else {
            this.signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            logger.info("JWT: Aucune clé détectée. Génération automatique d'une clé secrète sécurisée.");
        }
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Token JWT invalide ou expiré: {}", e.getMessage());
        }
        return false;
    }


}