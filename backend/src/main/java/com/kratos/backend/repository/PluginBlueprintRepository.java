package com.kratos.backend.repository;

import com.kratos.backend.model.PluginBlueprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PluginBlueprintRepository extends JpaRepository<PluginBlueprint, String > {

}
