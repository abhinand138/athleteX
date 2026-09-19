package com.athletex.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_audit_logs")
public class AdminAuditLog {

    @Id
    private String id;

    private String action; // e.g. USER_ROLE_UPDATED, USER_DETAILS_UPDATED, USER_DELETED, COACH_VERIFIED, COACH_REJECTED, ROSTER_PAIRING_CREATED, ROSTER_PAIRING_TERMINATED

    private String performedByAdminId;

    private String performedByAdminName;

    private String targetEntityId;

    private String targetEntityName;

    private String details;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
