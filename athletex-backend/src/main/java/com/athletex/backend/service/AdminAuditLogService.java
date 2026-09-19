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

    public String exportAuditLogsCsv() {
        List<AdminAuditLog> logs = getAllLogs();
        StringBuilder csv = new StringBuilder();
        csv.append("Log ID,Timestamp,Action,Admin Name,Target Entity,Details\n");
        for (AdminAuditLog log : logs) {
            csv.append(escapeCsv(log.getId())).append(",")
               .append(escapeCsv(log.getTimestamp() != null ? log.getTimestamp().toString() : "")).append(",")
               .append(escapeCsv(log.getAction())).append(",")
               .append(escapeCsv(log.getPerformedByAdminName())).append(",")
               .append(escapeCsv(log.getTargetEntityName())).append(",")
               .append(escapeCsv(log.getDetails())).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String text) {
        if (text == null) return "\"\"";
        String escaped = text.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
