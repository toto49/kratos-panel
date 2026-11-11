package com.kratos.backend.service;


import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.HardwareAbstractionLayer;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Service
public class SystemService {
    private final SystemInfo systemInfo = new SystemInfo();
    private final HardwareAbstractionLayer hardware = systemInfo.getHardware();
    public Map<String, Object> getServerStatusReport(){
        Map<String, Object> report = new HashMap<>();
        long gbDivisor = 1024 * 1024 * 1024;


        File root = new File("/");
        long totalSpace = root.getTotalSpace();
        long freeSpace = root.getFreeSpace();
        long uptime =systemInfo.getOperatingSystem().getSystemUptime();

        String version =systemInfo.getOperatingSystem().getVersionInfo().getVersion()+" " +systemInfo.getOperatingSystem().getVersionInfo().getCodeName()+" " +systemInfo.getOperatingSystem().getVersionInfo().getBuildNumber();
        Map<String, Object> storage = new HashMap<>();
        storage.put("totalGB", totalSpace / gbDivisor);
        storage.put("freeGB", freeSpace / gbDivisor);
        storage.put("usedGB", (totalSpace - freeSpace) / gbDivisor);
        Map <String, Object>  os = new HashMap<>();
        os.put("uptime",uptime);
        os.put("os", systemInfo.getOperatingSystem().getFamily());
        os.put("manufacturer", systemInfo.getOperatingSystem().getManufacturer());
        os.put("architecture", systemInfo.getOperatingSystem().getBitness());
        os.put("version", version   );
        report.put("storage", storage);
        report.put("os", os);

        return report;

    }
}
