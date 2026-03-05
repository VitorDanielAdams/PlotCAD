-- Migration 004: Add Employees table

CREATE TABLE Employees (
    Id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    TenantId   CHAR(36)      NOT NULL,
    Name       VARCHAR(255)  NOT NULL,
    Phone      VARCHAR(50)   NULL,
    Email      VARCHAR(255)  NULL,
    Position   VARCHAR(255)  NULL,
    IsActive   TINYINT(1)    NOT NULL DEFAULT 1,
    UserId     INT           NULL,
    CreatedAt  DATETIME(6)   NOT NULL,
    UpdatedAt  DATETIME(6)   NULL,
    DeletedAt  DATETIME(6)   NULL,
    INDEX idx_employees_tenant   (TenantId),
    INDEX idx_employees_user     (UserId)
);
