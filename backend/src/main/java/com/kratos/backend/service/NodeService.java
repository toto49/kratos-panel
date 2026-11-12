package com.kratos.backend.service;


import com.kratos.backend.dto.CreateNodeRequest;
import com.kratos.backend.dto.NodeResponse;
import com.kratos.backend.model.Node;
import com.kratos.backend.model.User;
import com.kratos.backend.repository.NodeRepository;
import com.kratos.backend.repository.UserRepository;
import com.kratos.backend.websocket.AgentWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NodeService {
    private final NodeRepository nodeRepository;
    private final UserRepository userRepository;
    private final AgentWebSocketHandler agentWebSocketHandler;

    @Transactional
    public NodeResponse createNode(Long userId, CreateNodeRequest request){
        User user = userRepository.findById(userId).orElseThrow(()-> new IllegalArgumentException("Utilisateur introuvable"));
        String generatedToken = "kr_node_" + UUID.randomUUID().toString().replace("-", "");

        Node node = Node.builder()
                .name(request.getName())
                .fqdn(request.getFqdn())
                .agentToken(generatedToken)
                .isOnline(false)
                .build();

        Node saved = nodeRepository.save(node);
        return NodeResponse.fromEntity(saved);
    }

    public List <NodeResponse> getNodes(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        List<Node> nodes = nodeRepository.findAll();

        return nodes.stream()
                .map(NodeResponse::fromEntity)
                .toList();

    }
    @Transactional
    public void deleteNode(Long userId, Long id) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        Node node = nodeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Node introuvable"));
        agentWebSocketHandler.disconnectNode(node.getUuid());
        nodeRepository.delete(node);

    }
}
