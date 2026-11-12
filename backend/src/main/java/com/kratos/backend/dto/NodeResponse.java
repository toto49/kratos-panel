package com.kratos.backend.dto;
import com.kratos.backend.model.Node;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeResponse {
    private Long id;

    private String uuid;

    private String name;

    private String fqdn;

    private String agentToken;

    private Boolean isOnline;

    private Instant lastSeenAt;

    private Integer cpuCores;

    private Long ramTotalMb;

    private Long diskTotalGb;

    private String osInfo;

    private Instant createdAt;

    private Instant updatedAt;

    public static NodeResponse fromEntity(Node node){
        return NodeResponse.builder()
                .id(node.getId())
                .uuid(node.getUuid())
                .name(node.getName())
                .fqdn(node.getFqdn())
                .agentToken(node.getAgentToken())
                .isOnline(node.getIsOnline())
                .lastSeenAt(node.getLastSeenAt())
                .cpuCores(node.getCpuCores())
                .ramTotalMb(node.getRamTotalMb())
                .diskTotalGb(node.getDiskTotalGb())
                .osInfo(node.getOsInfo())
                .createdAt(node.getCreatedAt())
                .updatedAt(node.getUpdatedAt())
                .build();
    }
}
