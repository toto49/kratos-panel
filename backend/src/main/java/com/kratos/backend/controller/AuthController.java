package com.kratos.backend.controller;

import com.kratos.backend.dto.AuthResponse;
import com.kratos.backend.dto.CreateUserRequest;
import com.kratos.backend.dto.LoginUserRequest;
import com.kratos.backend.dto.UserResponse;
import com.kratos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(
                Map.of("initialized", userService.isInitialized())
        );
    }

    @PostMapping("/setup")
    public ResponseEntity<UserResponse> setupAdmin(
            @RequestBody CreateUserRequest createUserRequest
    ) {
        return ResponseEntity.ok(
                userService.initAdminUser(createUserRequest)
        );
    }

    @PostMapping()
        public ResponseEntity<AuthResponse> LoginUser(@RequestBody LoginUserRequest loginUserRequest) {
        return ResponseEntity.ok(
                userService.loginUser(loginUserRequest));
    }
}