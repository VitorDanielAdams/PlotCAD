-- =============================================
-- Migration 003: Backoffice, Modules, Audit
-- Adds tables for backoffice managers, module
-- system, audit logging, and subscription history.
-- =============================================

-- =============================================
-- Backoffice Managers (separate from tenant Users)
-- These are PlotCAD internal team members who
-- manage the entire platform.
-- =============================================
CREATE TABLE IF NOT EXISTS BackofficeManagers (
    Id             SERIAL PRIMARY KEY,
    Name           VARCHAR(200) NOT NULL,
    Email          VARCHAR(200) NOT NULL UNIQUE,
    PasswordHash   VARCHAR(255) NOT NULL,
    IsActive       BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt      TIMESTAMPTZ NULL
);

-- =============================================
-- Modules (features that can be toggled per tenant)
-- =============================================
CREATE TABLE IF NOT EXISTS Modules (
    Id          SERIAL PRIMARY KEY,
    Code        VARCHAR(50) NOT NULL UNIQUE,
    Name        VARCHAR(200) NOT NULL,
    Description TEXT NULL,
    IsActive    BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Tenant Modules (which modules each tenant has)
-- =============================================
CREATE TABLE IF NOT EXISTS TenantModules (
    Id         SERIAL PRIMARY KEY,
    TenantId   UUID NOT NULL REFERENCES Tenants(Id),
    ModuleId   INT NOT NULL REFERENCES Modules(Id),
    IsEnabled  BOOLEAN NOT NULL DEFAULT TRUE,
    EnabledAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    DisabledAt TIMESTAMPTZ NULL,
    UNIQUE(TenantId, ModuleId)
);

CREATE INDEX IF NOT EXISTS idx_tenantmodules_tenant ON TenantModules (TenantId);

-- =============================================
-- Audit Log (track all backoffice actions)
-- LGPD Art. 37: processing records
-- =============================================
CREATE TABLE IF NOT EXISTS AuditLogs (
    Id           BIGSERIAL PRIMARY KEY,
    ManagerId    INT NULL REFERENCES BackofficeManagers(Id),
    Action       VARCHAR(100) NOT NULL,
    EntityType   VARCHAR(50) NOT NULL,
    EntityId     VARCHAR(100) NOT NULL,
    Details      JSONB NULL,
    IpAddress    VARCHAR(45) NULL,
    CreatedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditlogs_manager ON AuditLogs (ManagerId);
CREATE INDEX IF NOT EXISTS idx_auditlogs_entity ON AuditLogs (EntityType, EntityId);
CREATE INDEX IF NOT EXISTS idx_auditlogs_created ON AuditLogs (CreatedAt);

-- =============================================
-- Subscription History
-- =============================================
CREATE TABLE IF NOT EXISTS SubscriptionHistory (
    Id                BIGSERIAL PRIMARY KEY,
    TenantId          UUID NOT NULL REFERENCES Tenants(Id),
    PlanType          SMALLINT NOT NULL,
    Status            SMALLINT NOT NULL,
    StripeEventId     VARCHAR(255) NULL,
    StripeSessionId   VARCHAR(255) NULL,
    Amount            DECIMAL(10,2) NULL,
    Currency          VARCHAR(3) NULL DEFAULT 'BRL',
    CreatedAt         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subhistory_tenant ON SubscriptionHistory (TenantId);

-- =============================================
-- Add Stripe customer ID to Tenants
-- =============================================
ALTER TABLE Tenants
    ADD COLUMN IF NOT EXISTS StripeCustomerId VARCHAR(255) NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_stripe ON Tenants (StripeCustomerId);

-- =============================================
-- Seed: default backoffice manager
-- Password: Admin@1234
-- Hash generated with BCrypt SHA384 WorkFactor=12
-- =============================================
INSERT INTO BackofficeManagers (Name, Email, PasswordHash, IsActive, CreatedAt)
VALUES ('Admin', 'admin@plotcad.internal', '$2a$12$Pai8CEX11a.uD5UAPXMvhO/XeVbnfnioYF7jacBfshRVpbf4.NMI6', true, NOW())
ON CONFLICT (Email) DO NOTHING;

-- =============================================
-- Seed: default modules
-- =============================================
INSERT INTO Modules (Code, Name, Description, IsActive, CreatedAt) VALUES
    ('land_draw',   'Desenho de Terreno',   'Ferramenta de desenho de terrenos no mapa', true, NOW()),
    ('kml_export',  'Exportacao KML',       'Exportar terrenos em formato KML',         true, NOW()),
    ('employees',   'Funcionarios',         'Gestao de funcionarios do escritorio',      true, NOW())
ON CONFLICT (Code) DO NOTHING;
