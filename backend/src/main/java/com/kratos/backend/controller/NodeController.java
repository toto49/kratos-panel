package com.kratos.backend.controller;

import com.kratos.backend.dto.CreateNodeRequest;
import com.kratos.backend.dto.NodeResponse;
import com.kratos.backend.service.NodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @PostMapping
    public ResponseEntity<NodeResponse> createNode(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateNodeRequest request
    ) {
        Long authenticatedUserId = Long.valueOf(userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(nodeService.createNode(authenticatedUserId, request));
    }

    @GetMapping
    public ResponseEntity<List<NodeResponse>> getNodes(@AuthenticationPrincipal String userId){
        Long authenticatedUserId = Long.valueOf(userId);
        return ResponseEntity.ok(nodeService.getNodes(authenticatedUserId));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@AuthenticationPrincipal String userId, @PathVariable Long id){
        Long authenticatedUserId = Long.valueOf(userId);
        nodeService.deleteNode(authenticatedUserId, id);
        return ResponseEntity.noContent().build();
    }
}
