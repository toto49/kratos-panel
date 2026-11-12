package com.kratos.backend.repository;

import com.kratos.backend.model.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {
    Optional<Node> findByUuid(String uuid);
    Optional<Node> findByAgentToken(String agentToken);
}
