package com.kratos.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "pseudo", unique = true, nullable = false, length = 50)
    private String pseudo;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "mail", unique = true, nullable = false)
    private String mail;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false)
    private Permission permission;

    @Column(name = "last_connexion")
    private LocalDateTime lastConnexion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;



}
