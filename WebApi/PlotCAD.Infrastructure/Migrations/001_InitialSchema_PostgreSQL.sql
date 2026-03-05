-- =============================================
-- PlotCAD Database Schema
-- Database: PostgreSQL 16 + PostGIS 3.4
-- Consolidates MySQL migrations 001-005
-- =============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================
-- Tenants
-- =============================================
CREATE TABLE IF NOT EXISTS Tenants (
    Id                       UUID NOT NULL PRIMARY KEY,
    Name                     VARCHAR(255) NOT NULL,
    PlanType                 SMALLINT NOT NULL DEFAULT 0,
    MaxUsers                 INT NOT NULL DEFAULT 1,
    SubscriptionStatus       SMALLINT NOT NULL DEFAULT 1,
    SubscriptionExpiresAt    TIMESTAMPTZ NULL,
    ExternalSubscriptionId   VARCHAR(255) NULL,
    CreatedAt                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt                TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON Tenants (SubscriptionStatus);
CREATE INDEX IF NOT EXISTS idx_tenants_external ON Tenants (ExternalSubscriptionId);

-- =============================================
-- Users
-- =============================================
CREATE TABLE IF NOT EXISTS Users (
    Id             SERIAL PRIMARY KEY,
    TenantId       UUID NOT NULL REFERENCES Tenants(Id),
    Name           VARCHAR(200) NOT NULL,
    Email          VARCHAR(200) NOT NULL,
    PasswordHash   VARCHAR(255) NOT NULL,
    Role           VARCHAR(20) NOT NULL,
    IsActive       BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt      TIMESTAMPTZ NULL,
    DeletedAt      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS ix_users_tenantid ON Users (TenantId);
CREATE INDEX IF NOT EXISTS ix_users_role ON Users (Role);
CREATE INDEX IF NOT EXISTS ix_users_name ON Users (Name);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_tenantid_email ON Users (TenantId, Email);

-- =============================================
-- Lands
-- =============================================
CREATE TABLE IF NOT EXISTS Lands (
    Id                   SERIAL PRIMARY KEY,
    TenantId             UUID NOT NULL REFERENCES Tenants(Id),
    UserId               INT NOT NULL DEFAULT 0,
    Name                 VARCHAR(200) NOT NULL,
    RegistrationNumber   VARCHAR(50) NOT NULL,
    Location             VARCHAR(500) NOT NULL,
    Client               VARCHAR(200) NOT NULL DEFAULT '',
    Notes                TEXT NULL,
    TotalArea            DECIMAL(15,4) NOT NULL DEFAULT 0,
    Perimeter            DECIMAL(15,4) NOT NULL DEFAULT 0,
    IsClosed             BOOLEAN NOT NULL DEFAULT FALSE,
    IsActive             BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt            TIMESTAMPTZ NULL,
    DeletedAt            TIMESTAMPTZ NULL,
    -- PostGIS: geometry column for future spatial queries
    Geom                 GEOMETRY(Polygon, 4326) NULL
);

CREATE INDEX IF NOT EXISTS ix_lands_tenantid ON Lands (TenantId);
CREATE INDEX IF NOT EXISTS ix_lands_registrationnumber ON Lands (RegistrationNumber);
CREATE INDEX IF NOT EXISTS ix_lands_isactive ON Lands (IsActive);
CREATE INDEX IF NOT EXISTS ix_lands_userid ON Lands (UserId);
CREATE INDEX IF NOT EXISTS ix_lands_geom ON Lands USING GIST (Geom);

-- =============================================
-- LandSegments
-- =============================================
CREATE TABLE IF NOT EXISTS LandSegments (
    Id              SERIAL PRIMARY KEY,
    TenantId        UUID NOT NULL,
    LandId          INT NOT NULL REFERENCES Lands(Id) ON DELETE CASCADE,
    SortOrder       INT NOT NULL DEFAULT 0,
    FromDirection   VARCHAR(10) NOT NULL,
    ToDirection     VARCHAR(10) NOT NULL,
    Degrees         INT NOT NULL DEFAULT 0,
    Minutes         INT NOT NULL DEFAULT 0,
    Seconds         INT NOT NULL DEFAULT 0,
    Distance        DECIMAL(15,4) NOT NULL DEFAULT 0,
    Label           VARCHAR(100) NOT NULL DEFAULT '',
    BearingRaw      VARCHAR(20) NOT NULL DEFAULT '',
    CreatedAt       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt       TIMESTAMPTZ NULL,
    DeletedAt       TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS ix_landsegments_tenantid ON LandSegments (TenantId);
CREATE INDEX IF NOT EXISTS ix_landsegments_landid ON LandSegments (LandId);
CREATE INDEX IF NOT EXISTS ix_landsegments_sortorder ON LandSegments (LandId, SortOrder);

-- =============================================
-- Employees
-- =============================================
CREATE TABLE IF NOT EXISTS Employees (
    Id         SERIAL PRIMARY KEY,
    TenantId   UUID NOT NULL REFERENCES Tenants(Id),
    Name       VARCHAR(500) NOT NULL,
    Phone      VARCHAR(200) NULL,
    Email      VARCHAR(500) NULL,
    Position   VARCHAR(255) NULL,
    IsActive   BOOLEAN NOT NULL DEFAULT TRUE,
    UserId     INT NULL,
    CreatedAt  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UpdatedAt  TIMESTAMPTZ NULL,
    DeletedAt  TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_tenant ON Employees (TenantId);
CREATE INDEX IF NOT EXISTS idx_employees_user ON Employees (UserId);

-- =============================================
-- Seed: default tenant
-- =============================================
INSERT INTO Tenants (Id, Name, PlanType, MaxUsers, SubscriptionStatus, CreatedAt)
VALUES ('97735318-a9de-4de9-9375-fd0e9270819c', 'Default', 1, 100, 1, NOW())
ON CONFLICT (Id) DO NOTHING;

-- =============================================
-- Seed: default admin user
-- =============================================
-- Password: Admin@1234
-- Hash: $2a$12$Pai8CEX11a.uD5UAPXMvhO/XeVbnfnioYF7jacBfshRVpbf4.NMI6
-- =============================================
INSERT INTO Users (Id, TenantId, Name, Email, PasswordHash, Role, IsActive, CreatedAt)
VALUES (1, '97735318-a9de-4de9-9375-fd0e9270819c', 'Admin', 'admin@plotcad.local', '$2a$12$Pai8CEX11a.uD5UAPXMvhO/XeVbnfnioYF7jacBfshRVpbf4.NMI6', 'Admin', true, NOW())
ON CONFLICT (Id) DO NOTHING;
