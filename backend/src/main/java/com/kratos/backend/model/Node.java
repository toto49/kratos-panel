package com.kratos.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;
@Entity
@Table(name = "nodes")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uuid", nullable = false, unique = true, updatable = false ,length = 36)
    private String uuid;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "fqdn", nullable = false, length = 255)
    private String fqdn;

    @Column(name = "agent_token", nullable = false, unique = true, length = 255)
    private String agentToken;

    @Builder.Default
    @Column(name = "is_online")
    private Boolean isOnline = false;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "cpu_cores")
    private Integer cpuCores;

    @Column(name = "ram_total_mb")
    private Long ramTotalMb;

    @Column(name = "disk_total_gb")
    private Long diskTotalGb;

    @Column(name = "os_info", length = 150)
    private String osInfo;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();


    @PrePersist
    public void prePersist() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
