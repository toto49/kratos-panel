package com.kratos.backend.service;


import com.kratos.backend.config.JwtUtils;
import com.kratos.backend.dto.AuthResponse;
import com.kratos.backend.dto.CreateUserRequest;
import com.kratos.backend.dto.LoginUserRequest;
import com.kratos.backend.dto.UserResponse;
import com.kratos.backend.model.Permission;
import com.kratos.backend.model.User;
import com.kratos.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional(readOnly = true)
    public boolean isInitialized() {
        return userRepository.count() > 0;
    }

    public UserResponse initAdminUser(CreateUserRequest request)  {
        if(isInitialized()) {
            throw new IllegalStateException("Le système est déjà initialisé. Un administrateur existe déjà.");
        }
        User admin = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .pseudo(request.getPseudo())
                .mail(request.getMail())
                .password(passwordEncoder.encode(request.getPassword()))
                .permission(Permission.ADMIN)
                .build();
        User saved = userRepository.save(admin);
        return UserResponse.fromEntity(saved);

    }

    public AuthResponse loginUser(LoginUserRequest request)  {
        User user = userRepository.findByPseudo(request.getPseudo()).orElseThrow(() -> new IllegalArgumentException("Identifiants incorrects"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalStateException("Identifiant incorrecte");
        }
        user.setLastConnexion(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getPseudo(), user.getPermission().name());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromEntity(user))
                .build();
    }



}
