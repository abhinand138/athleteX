package com.athletex.backend.service;

import com.athletex.backend.model.AdminAuditLog;
import com.athletex.backend.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

    private final AdminAuditLogRepository auditLogRepository;

    public AdminAuditLog logAction(String action, String performedByAdminId, String performedByAdminName,
                                  String targetEntityId, String targetEntityName, String details) {
        AdminAuditLog log = AdminAuditLog.builder()
                .action(action)
                .performedByAdminId(performedByAdminId != null ? performedByAdminId : "SYSTEM_ADMIN")
                .performedByAdminName(performedByAdminName != null ? performedByAdminName : "System Administrator")
                .targetEntityId(targetEntityId)
                .targetEntityName(targetEntityName)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        return auditLogRepository.save(log);
    }

    public List<AdminAuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AdminAuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    public void clearAllLogs() {
        auditLogRepository.deleteAll();
    }
}
