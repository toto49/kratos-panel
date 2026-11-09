package com.kratos.backend.dto;

import com.kratos.backend.model.Permission;
import com.kratos.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String prenom;
    private String nom;
    private String pseudo;
    private String password;
    private String mail;
    private Permission permission;
    private LocalDateTime lastConnexion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .pseudo(user.getPseudo())
                .password(user.getPassword())
                .mail(user.getMail())
                .permission(user.getPermission())
                .lastConnexion(user.getLastConnexion())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

}
