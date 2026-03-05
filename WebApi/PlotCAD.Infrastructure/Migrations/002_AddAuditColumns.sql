-- =============================================
-- Migration 002: Add audit columns to Lands and Users
-- Tables created from 001 are missing CreatedBy/UpdatedBy/DeletedBy
-- from AuditableEntity which both Land and User extend.
-- =============================================

ALTER TABLE Lands
    ADD COLUMN IF NOT EXISTS CreatedBy  INT          NULL,
    ADD COLUMN IF NOT EXISTS UpdatedBy  VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS DeletedBy  VARCHAR(200) NULL;

ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS CreatedBy  INT          NULL,
    ADD COLUMN IF NOT EXISTS UpdatedBy  VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS DeletedBy  VARCHAR(200) NULL;
