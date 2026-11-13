package com.kratos.backend.service;

import com.kratos.backend.model.PluginBlueprint;
import com.kratos.backend.repository.PluginBlueprintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PluginSyncService {

    private final PluginBlueprintRepository repository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    @Value("${kratos.plugins.repo-url:https://raw.githubusercontent.com/toto49/kratos-panel/develop/plugins}")
    private String baseRepoUrl;
    @Scheduled(cron = "0 0 4 * * *")
    public void scheduledPluginSync() {
        try {
            log.info("Démarrage de la synchronisation quotidienne des plugins...");
            syncFromGitHub();
            log.info("Synchronisation quotidienne des plugins terminée.");
        } catch (Exception e) {
            log.error("Échec de la synchronisation quotidienne des plugins : {}", e.getMessage());
        }
    }
    @Bean
    public ApplicationRunner initDefaultPlugins(PluginSyncService self) {
        return args -> {
            try {
                self.syncFromGitHub();
            } catch (Exception e) {
                log.warn("Synchronisation initiale des plugins ignorée : {}", e.getMessage());
            }
        };
    }

    @Transactional
    public List<PluginBlueprint> syncFromGitHub() throws Exception {
        String indexRaw = restClient.get()
                .uri(baseRepoUrl + "/index.json")
                .retrieve()
                .body(String.class);

        JsonNode indexNode = objectMapper.readTree(indexRaw);
        for (JsonNode entry : indexNode.get("plugins")) {
            String id = entry.get("id").asString();
            String file = entry.get("file").asString();

            String pluginRaw = restClient.get()
                    .uri(baseRepoUrl + "/" + file)
                    .retrieve()
                    .body(String.class);
            JsonNode pluginJson = objectMapper.readTree(pluginRaw);
            String remoteVersion = pluginJson.path("version").asString("");
            if (remoteVersion.isBlank()) {
                throw new IllegalStateException("Version absente pour le plugin " + id);
            }

            Optional<PluginBlueprint> existing = repository.findById(id);
            if (existing.isEmpty() || !existing.get().getVersion().equals(remoteVersion)) {
                PluginBlueprint bp = existing.orElseGet(PluginBlueprint::new);
                bp.setId(id);
                bp.setName(pluginJson.get("name").asString());
                bp.setVersion(remoteVersion);
                bp.setDescription(pluginJson.path("description").asString(""));
                bp.setDefinitionJson(pluginRaw);
                bp.setUpdatedAt(LocalDateTime.now());
                repository.save(bp);
            }
        }
        return repository.findAll();
    }
}