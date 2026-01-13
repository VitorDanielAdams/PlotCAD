-- =============================================
-- PlotCAD Database Schema
-- Database: MySQL 8.0+
-- =============================================

-- Users Table
CREATE TABLE IF NOT EXISTS `Users` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `TenantId` CHAR(36) NOT NULL,
    `Name` VARCHAR(200) NOT NULL,
    `Email` VARCHAR(200) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `Role` VARCHAR(20) NOT NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL,
    `DeletedAt` DATETIME(6) NULL,
    INDEX `IX_Users_TenantId` (`TenantId`),
    INDEX `IX_Users_Role` (`Role`),
    INDEX `IX_Users_Name` (`Name`),
    UNIQUE INDEX `IX_Users_TenantId_Email` (`TenantId`, `Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lands Table
CREATE TABLE IF NOT EXISTS `Lands` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `TenantId` CHAR(36) NOT NULL,
    `Name` VARCHAR(200) NOT NULL,
    `RegistrationNumber` INT NOT NULL,
    `TotalArea` INT NOT NULL,
    `Description` TEXT NULL,
    `Location` VARCHAR(500) NOT NULL,
    `Expression` TEXT NOT NULL,
    `Path` VARCHAR(1000) NOT NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT TRUE,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL,
    `DeletedAt` DATETIME(6) NULL,
    INDEX `IX_Lands_TenantId` (`TenantId`),
    INDEX `IX_Lands_RegistrationNumber` (`RegistrationNumber`),
    INDEX `IX_Lands_IsActive` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Geometries Table (if needed)
CREATE TABLE IF NOT EXISTS `Geometries` (
    `Id` INT AUTO_INCREMENT PRIMARY KEY,
    `TenantId` CHAR(36) NOT NULL,
    `LandId` INT NOT NULL,
    `Type` VARCHAR(50) NOT NULL,
    `Coordinates` TEXT NOT NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL,
    `DeletedAt` DATETIME(6) NULL,
    INDEX `IX_Geometries_TenantId` (`TenantId`),
    INDEX `IX_Geometries_LandId` (`LandId`),
    FOREIGN KEY (`LandId`) REFERENCES `Lands`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
