package com.kratos.backend.controller;

import com.kratos.backend.dto.PluginResponse;
import com.kratos.backend.repository.PluginBlueprintRepository;
import com.kratos.backend.service.PluginSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RestController
@RequestMapping("/api/plugins")
@RequiredArgsConstructor
public class PluginController {

    private final PluginBlueprintRepository pluginRepository;
    private final PluginSyncService pluginSyncService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<PluginResponse>> getAllPlugins() {
        List<PluginResponse> plugins = pluginRepository.findAll()
                .stream()
                .map(bp -> PluginResponse.from(bp, objectMapper))
                .toList();
        return ResponseEntity.ok(plugins);
    }

    @PostMapping("/sync")
    public ResponseEntity<List<PluginResponse>> syncPlugins() throws Exception {
        List<PluginResponse> updated = pluginSyncService.syncFromGitHub()
                .stream()
                .map(bp -> PluginResponse.from(bp, objectMapper))
                .toList();
        return ResponseEntity.ok(updated);
    }
}