package com.kratos.backend.controller;

import com.kratos.backend.dto.DeployServiceRequest;
import com.kratos.backend.dto.ServiceInstanceResponse;
import com.kratos.backend.service.ServiceInstanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceInstanceController {

    private final ServiceInstanceService serviceInstanceService;

    @GetMapping
    public ResponseEntity<List<ServiceInstanceResponse>> listServices() {
        return ResponseEntity.ok(serviceInstanceService.getAllServices());
    }

    @PostMapping
    public ResponseEntity<ServiceInstanceResponse> deployService(@Valid @RequestBody DeployServiceRequest request) throws Exception {
        ServiceInstanceResponse created = serviceInstanceService.deployService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/{action}")
    public ResponseEntity<Void> controlService(@PathVariable Long id, @PathVariable String action) throws Exception {
        String command = switch (action.toLowerCase()) {
            case "start" -> "START_SERVICE";
            case "stop" -> "STOP_SERVICE";
            case "restart" -> "RESTART_SERVICE";
            default -> throw new IllegalArgumentException("Action non supportée : " + action);
        };
        serviceInstanceService.controlService(id, command);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) throws Exception {
        serviceInstanceService.controlService(id, "REMOVE_SERVICE");
        return ResponseEntity.noContent().build();
    }
}