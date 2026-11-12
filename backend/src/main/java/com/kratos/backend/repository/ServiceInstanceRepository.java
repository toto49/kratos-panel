package com.kratos.backend.repository;

import com.kratos.backend.model.ServiceInstance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceInstanceRepository extends JpaRepository<ServiceInstance, Long> {
    List<ServiceInstance> findAllByOrderByCreatedAtDesc();
    List<ServiceInstance> findAllByNodeId(Long nodeId);
}
