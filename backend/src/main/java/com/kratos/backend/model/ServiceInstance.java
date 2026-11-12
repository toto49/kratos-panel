package com.kratos.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "container_name", nullable = false, unique = true)
    private String containerName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plugin_id", nullable = false)
    private PluginBlueprint plugin;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DEPLOYING"; // DEPLOYING, RUNNING, STOPPED, ERROR

    @Column(name = "env_vars_json", columnDefinition = "TEXT", nullable = false)
    private String envVarsJson;

    @Column(name = "plugin_version", nullable = false)
    private String pluginVersion;

    @Column(name = "blueprint_snapshot_json", columnDefinition = "TEXT", nullable = false)
    private String blueprintSnapshotJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}