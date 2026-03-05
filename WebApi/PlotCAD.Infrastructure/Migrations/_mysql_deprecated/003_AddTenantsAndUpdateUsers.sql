-- Migration 003: Add Tenants table and index on Users.TenantId

CREATE TABLE Tenants (
    Id                     CHAR(36)      NOT NULL PRIMARY KEY,
    Name                   VARCHAR(255)  NOT NULL,
    PlanType               TINYINT       NOT NULL DEFAULT 0,
    MaxUsers               INT           NOT NULL DEFAULT 1,
    SubscriptionStatus     TINYINT       NOT NULL DEFAULT 1,
    SubscriptionExpiresAt  DATETIME(6)   NULL,
    ExternalSubscriptionId VARCHAR(255)  NULL,
    CreatedAt              DATETIME(6)   NOT NULL,
    UpdatedAt              DATETIME(6)   NULL,
    INDEX idx_tenants_status   (SubscriptionStatus),
    INDEX idx_tenants_external (ExternalSubscriptionId)
);

ALTER TABLE Users
    ADD INDEX idx_users_tenant (TenantId);

-- Seed: default tenant for existing data
INSERT INTO Tenants (Id, Name, PlanType, MaxUsers, SubscriptionStatus, CreatedAt)
VALUES ('97735318-a9de-4de9-9375-fd0e9270819c', 'Default', 1, 100, 1, NOW());

