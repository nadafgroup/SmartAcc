-- ============================================
-- Financial Year Table
-- ============================================
-- This table stores financial year information for each firm and branch
-- Compatible with SQL Server 2008 R2
-- ============================================

-- Drop table if it exists (use with caution)
-- IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FinancialYears]') AND type in (N'U'))
-- BEGIN
--     DROP TABLE [dbo].[FinancialYears];
-- END
-- GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FinancialYears]') AND type in (N'U'))
BEGIN
    -- Create FinancialYears table
    CREATE TABLE [dbo].[FinancialYears] (
        [FinancialYearID] INT IDENTITY(1,1) PRIMARY KEY,
        [FirmID] INT NOT NULL,
        [BranchID] INT NULL,
        [YearCode] NVARCHAR(20) NOT NULL, -- e.g., '2025-26'
        [YearName] NVARCHAR(100) NOT NULL, -- e.g., 'Financial Year 2025-26'
        [StartDate] DATE NOT NULL,
        [EndDate] DATE NOT NULL,
        [IsCurrent] BIT DEFAULT 0,
        [IsActive] BIT DEFAULT 1,
        [Remarks] NVARCHAR(500) NULL,
        [CreatedBy] NVARCHAR(50) NULL,
        [CreatedDate] DATETIME DEFAULT GETDATE(),
        [ModifiedDate] DATETIME NULL
    );

    -- Foreign Key to Firms table
    ALTER TABLE [dbo].[FinancialYears]
    ADD CONSTRAINT FK_FinancialYears_Firms 
    FOREIGN KEY ([FirmID]) REFERENCES [dbo].[Firms]([FirmID]) 
    ON DELETE CASCADE;

    -- Foreign Key to Branches table
    ALTER TABLE [dbo].[FinancialYears]
    ADD CONSTRAINT FK_FinancialYears_Branches 
    FOREIGN KEY ([BranchID]) REFERENCES [dbo].[Branches]([BranchID]) 
    ON DELETE SET NULL;

    -- Indexes for performance
    CREATE INDEX IX_FinancialYears_FirmID ON [dbo].[FinancialYears]([FirmID]);
    CREATE INDEX IX_FinancialYears_BranchID ON [dbo].[FinancialYears]([BranchID]);
    CREATE INDEX IX_FinancialYears_YearCode ON [dbo].[FinancialYears]([YearCode]);
    CREATE INDEX IX_FinancialYears_IsCurrent ON [dbo].[FinancialYears]([IsCurrent]);
    CREATE INDEX IX_FinancialYears_IsActive ON [dbo].[FinancialYears]([IsActive]);
    CREATE INDEX IX_FinancialYears_StartDate ON [dbo].[FinancialYears]([StartDate]);
    CREATE INDEX IX_FinancialYears_EndDate ON [dbo].[FinancialYears]([EndDate]);
    CREATE INDEX IX_FinancialYears_IsCurrent_FirmID ON [dbo].[FinancialYears]([IsCurrent], [FirmID]);
    CREATE INDEX IX_FinancialYears_IsCurrent_BranchID ON [dbo].[FinancialYears]([IsCurrent], [BranchID]);
    CREATE INDEX IX_FinancialYears_FirmID_BranchID ON [dbo].[FinancialYears]([FirmID], [BranchID]);

    -- Insert sample data for each firm
    -- Firm-level financial years (BranchID = NULL)
    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        f.FirmID,
        NULL,
        '2025-26',
        'Financial Year 2025-26',
        '2025-04-01',
        '2026-03-31',
        1,
        1,
        'Current Financial Year (Firm Level)',
        'Admin'
    FROM [dbo].[Firms] f;

    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        f.FirmID,
        NULL,
        '2024-25',
        'Financial Year 2024-25',
        '2024-04-01',
        '2025-03-31',
        0,
        1,
        'Previous Financial Year (Firm Level)',
        'Admin'
    FROM [dbo].[Firms] f;

    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        f.FirmID,
        NULL,
        '2026-27',
        'Financial Year 2026-27',
        '2026-04-01',
        '2027-03-31',
        0,
        0,
        'Next Financial Year (Firm Level)',
        'Admin'
    FROM [dbo].[Firms] f;

    -- Branch-level financial years (for each branch that exists)
    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        b.FirmID,
        b.BranchID,
        '2025-26-BR',
        'Branch Financial Year 2025-26',
        '2025-04-01',
        '2026-03-31',
        1,
        1,
        'Current Branch Financial Year',
        'Admin'
    FROM [dbo].[Branches] b;

    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        b.FirmID,
        b.BranchID,
        '2024-25-BR',
        'Branch Financial Year 2024-25',
        '2024-04-01',
        '2025-03-31',
        0,
        1,
        'Previous Branch Financial Year',
        'Admin'
    FROM [dbo].[Branches] b;

    INSERT INTO [dbo].[FinancialYears] (FirmID, BranchID, YearCode, YearName, StartDate, EndDate, IsCurrent, IsActive, Remarks, CreatedBy)
    SELECT 
        b.FirmID,
        b.BranchID,
        '2026-27-BR',
        'Branch Financial Year 2026-27',
        '2026-04-01',
        '2027-03-31',
        0,
        0,
        'Next Branch Financial Year',
        'Admin'
    FROM [dbo].[Branches] b;
END;
GO

-- Create trigger to ensure only one current financial year per firm and branch combination
CREATE TRIGGER trg_FinancialYears_OnlyOneCurrent
ON [dbo].[FinancialYears]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- For records with BranchID (branch-level financial years)
    IF EXISTS (SELECT 1 FROM inserted WHERE IsCurrent = 1 AND BranchID IS NOT NULL)
    BEGIN
        -- Set all other branch-level records for the same firm and branch to IsCurrent = 0
        UPDATE [dbo].[FinancialYears]
        SET IsCurrent = 0
        WHERE FirmID IN (SELECT FirmID FROM inserted WHERE IsCurrent = 1 AND BranchID IS NOT NULL)
        AND BranchID IN (SELECT BranchID FROM inserted WHERE IsCurrent = 1 AND BranchID IS NOT NULL)
        AND FinancialYearID NOT IN (SELECT FinancialYearID FROM inserted WHERE IsCurrent = 1 AND BranchID IS NOT NULL);
    END
    
    -- For records without BranchID (firm-level financial years)
    IF EXISTS (SELECT 1 FROM inserted WHERE IsCurrent = 1 AND BranchID IS NULL)
    BEGIN
        -- Set all other firm-level records for the same firm to IsCurrent = 0
        UPDATE [dbo].[FinancialYears]
        SET IsCurrent = 0
        WHERE FirmID IN (SELECT FirmID FROM inserted WHERE IsCurrent = 1 AND BranchID IS NULL)
        AND BranchID IS NULL
        AND FinancialYearID NOT IN (SELECT FinancialYearID FROM inserted WHERE IsCurrent = 1 AND BranchID IS NULL);
    END
END;
GO

-- Verify the table creation
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName
FROM sys.objects 
WHERE type = 'U' 
AND name = 'FinancialYears';

-- Display the table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'FinancialYears'
ORDER BY ORDINAL_POSITION;

-- Show foreign key relationships
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    ref.name AS ReferencedTable
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables ref ON fk.referenced_object_id = ref.object_id
WHERE tp.name = 'FinancialYears';

-- Show count of records inserted
SELECT 
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN BranchID IS NULL THEN 1 ELSE 0 END) AS FirmLevelRecords,
    SUM(CASE WHEN BranchID IS NOT NULL THEN 1 ELSE 0 END) AS BranchLevelRecords
FROM [dbo].[FinancialYears];

-- Preview sample data
SELECT TOP 10 
    fy.FinancialYearID,
    f.TradeName AS FirmName,
    b.Code AS BranchCode,
    b.Name AS BranchName,
    fy.YearCode,
    fy.YearName,
    fy.StartDate,
    fy.EndDate,
    CASE WHEN fy.IsCurrent = 1 THEN 'Yes' ELSE 'No' END AS IsCurrent,
    CASE WHEN fy.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS Status
FROM [dbo].[FinancialYears] fy
INNER JOIN [dbo].[Firms] f ON fy.FirmID = f.FirmID
LEFT JOIN [dbo].[Branches] b ON fy.BranchID = b.BranchID
ORDER BY fy.FinancialYearID;
