package com.kratos.backend.controller;

import com.kratos.backend.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {
    private final SystemService systemService;
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServerStatus(){
        return ResponseEntity.ok(systemService.getServerStatusReport());
    }

}
