package com.kratos.backend.websocket;

import com.kratos.backend.model.Node;
import com.kratos.backend.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentWebSocketHandler extends TextWebSocketHandler {

    private final NodeRepository nodeRepository;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, String> sessionToNodeUuid = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, WebSocketSession> activeNodeSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        String authHeader = session.getHandshakeHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Connexion agent refusée : Header Authorization manquant");
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        String token = authHeader.substring(7).trim();
        Optional<Node> nodeOpt = nodeRepository.findByAgentToken(token);

        if (nodeOpt.isEmpty()) {
            log.warn("Connexion agent refusée : Token inconnu");
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        Node node = nodeOpt.get();
        node.setIsOnline(true);
        node.setLastSeenAt(Instant.now());
        nodeRepository.save(node);

        sessionToNodeUuid.put(session.getId(), node.getUuid());
        activeNodeSessions.put(node.getUuid(), session);

        log.info("Agent connecté : {} ({})", node.getName(), node.getFqdn());
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String nodeUuid = sessionToNodeUuid.get(session.getId());
        if (nodeUuid == null) return;

        JsonNode json = objectMapper.readTree(message.getPayload());
        String type = json.path("type").asText();

        if ("HEARTBEAT".equals(type)) {
            nodeRepository.findByUuid(nodeUuid).ifPresent(node -> {
                node.setIsOnline(true);
                node.setLastSeenAt(Instant.now());
                node.setCpuCores(json.path("cpuCores").asInt());
                node.setRamTotalMb(json.path("ramTotalMb").asLong());
                node.setDiskTotalGb(json.path("diskTotalGb").asLong());
                node.setOsInfo(json.path("osInfo").asText());
                nodeRepository.save(node);
            });
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        String nodeUuid = sessionToNodeUuid.remove(session.getId());
        if (nodeUuid != null) {
            activeNodeSessions.remove(nodeUuid);
            nodeRepository.findByUuid(nodeUuid).ifPresent(node -> {
                node.setIsOnline(false);
                nodeRepository.save(node);
                log.info("Agent déconnecté : {}", node.getName());
            });
        }
    }

    public void disconnectNode(String nodeUuid) {
        WebSocketSession session = activeNodeSessions.remove(nodeUuid);
        if (session != null && session.isOpen()) {
            try {
                sessionToNodeUuid.remove(session.getId());
                session.close(CloseStatus.POLICY_VIOLATION);
            } catch (Exception e) {
                log.warn("Erreur lors de la fermeture de la session WebSocket pour le nœud {}", nodeUuid, e);
            }
        }
    }
    public void sendCommandToNode(String nodeUuid, String jsonPayload) {
        WebSocketSession session = activeNodeSessions.get(nodeUuid);

        if (session == null || !session.isOpen()) {
            throw new IllegalStateException("L'agent du serveur n'est pas connecté actuellement.");
        }

        try {
            synchronized (session) {
                session.sendMessage(new TextMessage(jsonPayload));
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de la commande au nœud {}", nodeUuid, e);
            throw new RuntimeException("Impossible de transmettre la commande à l'agent : " + e.getMessage(), e);
        }
    }

    public WebSocketSession getActiveSession(String nodeUuid) {
        return activeNodeSessions.get(nodeUuid);
    }
}