package com.kratos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record DeployServiceRequest(
        @NotBlank(message = "Le nom du service est obligatoire")
        String name,

        @NotNull(message = "Le serveur cible est obligatoire")
        Long nodeId,

        @NotBlank(message = "Le plugin est obligatoire")
        String pluginId,

        Map<String, String> envVars
) {}