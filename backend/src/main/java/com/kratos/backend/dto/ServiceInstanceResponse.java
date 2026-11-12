package com.kratos.backend.dto;

import com.kratos.backend.model.ServiceInstance;

import java.time.LocalDateTime;

public record ServiceInstanceResponse(
        Long id,
        String name,
        String containerName,
        String status,
        Long nodeId,
        String nodeName,
        String pluginId,
        String pluginName,
        String pluginVersion,
        LocalDateTime createdAt
) {
    public static ServiceInstanceResponse from(ServiceInstance s) {
        return new ServiceInstanceResponse(
                s.getId(),
                s.getName(),
                s.getContainerName(),
                s.getStatus(),
                s.getNode().getId(),
                s.getNode().getName(),
                s.getPlugin().getId(),
                s.getPlugin().getName(),
                s.getPluginVersion(),
                s.getCreatedAt()
        );
    }
}