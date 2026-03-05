-- =============================================
-- Migration 002 - Update Lands and Add LandSegments
-- Database: MySQL 8.0+
-- Changes:
--   - Alter Lands: new columns, type corrections, removed dead columns
--   - Create LandSegments table for bearing/distance polygon data
-- =============================================

-- Alter Lands table
ALTER TABLE `Lands`
    -- Fix type: registration numbers are formatted strings, not integers
    DROP INDEX `IX_Lands_RegistrationNumber`,
    MODIFY COLUMN `RegistrationNumber` VARCHAR(50) NOT NULL,

    -- Fix type: area is a decimal measurement
    MODIFY COLUMN `TotalArea` DECIMAL(15, 4) NOT NULL DEFAULT 0,

    -- Remove columns no longer in the domain model
    DROP COLUMN `Description`,
    DROP COLUMN `Expression`,
    DROP COLUMN `Path`,

    -- Add missing columns from AuditableEntity
    ADD COLUMN `CreatedBy` INT NULL,
    ADD COLUMN `UpdatedBy` VARCHAR(200) NULL,
    ADD COLUMN `DeletedBy` VARCHAR(200) NULL,

    -- Add new domain fields
    ADD COLUMN `UserId` INT NOT NULL DEFAULT 0,
    ADD COLUMN `Client` VARCHAR(200) NOT NULL DEFAULT '',
    ADD COLUMN `Notes` TEXT NULL,
    ADD COLUMN `Perimeter` DECIMAL(15, 4) NOT NULL DEFAULT 0,
    ADD COLUMN `IsClosed` BOOLEAN NOT NULL DEFAULT FALSE,

    -- Recreate index on the updated column type and new fields
    ADD INDEX `IX_Lands_RegistrationNumber` (`RegistrationNumber`),
    ADD INDEX `IX_Lands_UserId` (`UserId`);

-- Create LandSegments table
CREATE TABLE IF NOT EXISTS `LandSegments` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `TenantId` CHAR(36) NOT NULL,
    `LandId` INT NOT NULL,
    `SortOrder` INT NOT NULL DEFAULT 0,
    `FromDirection` VARCHAR(10) NOT NULL,
    `ToDirection` VARCHAR(10) NOT NULL,
    `Degrees` INT NOT NULL DEFAULT 0,
    `Minutes` INT NOT NULL DEFAULT 0,
    `Seconds` INT NOT NULL DEFAULT 0,
    `Distance` DECIMAL(15, 4) NOT NULL DEFAULT 0,
    `Label` VARCHAR(100) NOT NULL DEFAULT '',
    `BearingRaw` VARCHAR(20) NOT NULL DEFAULT '',
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL,
    `DeletedAt` DATETIME(6) NULL,
    INDEX `IX_LandSegments_TenantId` (`TenantId`),
    INDEX `IX_LandSegments_LandId` (`LandId`),
    INDEX `IX_LandSegments_SortOrder` (`LandId`, `SortOrder`),
    FOREIGN KEY (`LandId`) REFERENCES `Lands`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
