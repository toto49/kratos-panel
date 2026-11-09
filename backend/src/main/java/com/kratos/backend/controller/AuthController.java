package com.kratos.backend.controlller;

import com.kratos.backend.dto.CreateUserRequest;
import com.kratos.backend.dto.UserResponse;
import com.kratos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;

    @GetMapping("status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Map.of("Initialized", userService.isInitialized()));
    }

    @PostMapping("/setup")
    public ResponseEntity<UserResponse> setupAdmin(@RequestBody CreateUserRequest createUserRequest) {
        return ResponseEntity.ok(userService.initAdminUser(createUserRequest));
    }
}
