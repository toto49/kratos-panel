package com.kratos.backend.dto;

import com.kratos.backend.model.PluginBlueprint;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

public record PluginResponse(
        String id,
        String name,
        String version,
        String description,
        JsonNode definition,
        LocalDateTime updatedAt
) {
    public static PluginResponse from(PluginBlueprint bp, ObjectMapper mapper) {
        try {
            return new PluginResponse(
                    bp.getId(),
                    bp.getName(),
                    bp.getVersion(),
                    bp.getDescription(),
                    mapper.readTree(bp.getDefinitionJson()),
                    bp.getUpdatedAt()
            );
        } catch (Exception e) {
            throw new IllegalStateException("JSON invalide pour le plugin " + bp.getId(), e);
        }
    }
}