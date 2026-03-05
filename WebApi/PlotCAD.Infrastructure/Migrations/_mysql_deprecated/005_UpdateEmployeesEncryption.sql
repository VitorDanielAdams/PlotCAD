-- Migration 005: Update Employees table to support encrypted fields

ALTER TABLE Employees
    MODIFY COLUMN Name VARCHAR(500) NOT NULL,
    MODIFY COLUMN Phone VARCHAR(200) NULL,
    MODIFY COLUMN Email VARCHAR(500) NULL;
