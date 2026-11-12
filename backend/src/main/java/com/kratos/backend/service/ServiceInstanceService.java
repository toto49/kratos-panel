package com.kratos.backend.service;

import com.kratos.backend.dto.DeployServiceRequest;
import com.kratos.backend.dto.ServiceInstanceResponse;
import com.kratos.backend.model.Node;
import com.kratos.backend.model.PluginBlueprint;
import com.kratos.backend.model.ServiceInstance;
import com.kratos.backend.repository.NodeRepository;
import com.kratos.backend.repository.PluginBlueprintRepository;
import com.kratos.backend.repository.ServiceInstanceRepository;
import com.kratos.backend.websocket.AgentWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceInstanceService {

    private final ServiceInstanceRepository serviceRepository;
    private final NodeRepository nodeRepository;
    private final PluginBlueprintRepository pluginRepository;
    private final AgentWebSocketHandler agentWebSocketHandler;
    private final ObjectMapper objectMapper;

    public List<ServiceInstanceResponse> getAllServices() {
        return serviceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ServiceInstanceResponse::from)
                .toList();
    }

    @Transactional
    public ServiceInstanceResponse deployService(DeployServiceRequest req) throws Exception {
        Node node = nodeRepository.findById(req.nodeId())
                .orElseThrow(() -> new IllegalArgumentException("Serveur introuvable"));

        if (!Boolean.TRUE.equals(node.getIsOnline())) {
            throw new IllegalStateException("Le serveur cible est hors ligne");
        }

        PluginBlueprint plugin = pluginRepository.findById(req.pluginId())
                .orElseThrow(() -> new IllegalArgumentException("Plugin introuvable : " + req.pluginId()));

        String slug = req.name().toLowerCase().replaceAll("[^a-z0-9]+", "-");
        String containerName = "kratos-" + slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, String> envVars = req.envVars() != null ? req.envVars() : Map.of();

        // On fige la version et le blueprint au moment du déploiement
        ServiceInstance instance = ServiceInstance.builder()
                .name(req.name().trim())
                .containerName(containerName)
                .node(node)
                .plugin(plugin)
                .pluginVersion(plugin.getVersion())
                .blueprintSnapshotJson(plugin.getDefinitionJson())
                .status("DEPLOYING")
                .envVarsJson(objectMapper.writeValueAsString(envVars))
                .build();

        instance = serviceRepository.save(instance);

        Map<String, Object> payload = Map.of(
                "action", "DEPLOY_SERVICE",
                "serviceId", instance.getId(),
                "containerName", containerName,
                "blueprint", objectMapper.readTree(instance.getBlueprintSnapshotJson()),
                "envVars", envVars
        );
        agentWebSocketHandler.sendCommandToNode(node.getUuid(), objectMapper.writeValueAsString(payload));

        return ServiceInstanceResponse.from(instance);
    }

    @Transactional
    public void controlService(Long serviceId, String action) throws Exception {
        ServiceInstance instance = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Service introuvable"));

        Map<String, Object> payload = Map.of(
                "action", action,
                "serviceId", instance.getId(),
                "containerName", instance.getContainerName()
        );
        agentWebSocketHandler.sendCommandToNode(instance.getNode().getUuid(), objectMapper.writeValueAsString(payload));

        if ("REMOVE_SERVICE".equals(action)) {
            serviceRepository.delete(instance);
        }
    }
}