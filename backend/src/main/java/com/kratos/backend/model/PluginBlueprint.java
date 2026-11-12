package com.kratos.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "plugin_blueprints")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PluginBlueprint {

    @Id
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "version")
    private String version;

    @Column(name = "description")
    private String description;

    @Column(name = "definition_json", columnDefinition = "TEXT", nullable = false)
    private String definitionJson;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}