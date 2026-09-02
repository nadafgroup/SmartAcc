-- ============================================
-- Primary Group Table
-- ============================================
-- This table stores primary group information
-- References Account Groups and Account Info
-- Compatible with SQL Server 2008 R2
-- ============================================

-- Drop table if it exists (use with caution)
-- IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PrimaryGroups]') AND type in (N'U'))
-- BEGIN
--     DROP TABLE [dbo].[PrimaryGroups];
-- END
-- GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PrimaryGroups]') AND type in (N'U'))
BEGIN
    -- Create PrimaryGroups table
    CREATE TABLE [dbo].[PrimaryGroups] (
        [PrimaryGroupID] INT IDENTITY(1,1) PRIMARY KEY,
        [PrimaryGroupCode] NVARCHAR(50) NOT NULL UNIQUE,
        [PrimaryGroupName] NVARCHAR(100) NOT NULL,
        [GroupID] INT NULL, -- References AccountGroups
        [AccountInfoID] INT NULL, -- References AccountInfo
        [GroupType] NVARCHAR(50) NULL, -- Assets, Liabilities, Income, Expenses, Equity
        [NatureOfAccount] NVARCHAR(20) NULL, -- Debit, Credit
        [OpeningBalance] DECIMAL(18,2) DEFAULT 0,
        [IsConfirmed] BIT DEFAULT 0,
        [ConfirmedDate] DATETIME NULL,
        [IsActive] BIT DEFAULT 1,
        [Remarks] NVARCHAR(500) NULL,
        [CreatedBy] NVARCHAR(50) NULL,
        [CreatedDate] DATETIME DEFAULT GETDATE(),
        [ModifiedDate] DATETIME NULL
    );

    -- Foreign Key to AccountGroups table
    ALTER TABLE [dbo].[PrimaryGroups]
    ADD CONSTRAINT FK_PrimaryGroups_AccountGroups 
    FOREIGN KEY ([GroupID]) REFERENCES [dbo].[AccountGroups]([GroupID]) 
    ON DELETE SET NULL;

    -- Foreign Key to AccountInfo table
    ALTER TABLE [dbo].[PrimaryGroups]
    ADD CONSTRAINT FK_PrimaryGroups_AccountInfo 
    FOREIGN KEY ([AccountInfoID]) REFERENCES [dbo].[AccountInfo]([AccountInfoID]) 
    ON DELETE SET NULL;

    -- Indexes for performance
    CREATE INDEX IX_PrimaryGroups_GroupID ON [dbo].[PrimaryGroups]([GroupID]);
    CREATE INDEX IX_PrimaryGroups_AccountInfoID ON [dbo].[PrimaryGroups]([AccountInfoID]);
    CREATE INDEX IX_PrimaryGroups_IsActive ON [dbo].[PrimaryGroups]([IsActive]);
    CREATE INDEX IX_PrimaryGroups_IsConfirmed ON [dbo].[PrimaryGroups]([IsConfirmed]);
    CREATE INDEX IX_PrimaryGroups_PrimaryGroupCode ON [dbo].[PrimaryGroups]([PrimaryGroupCode]);

    -- Insert sample data
    -- Sample Primary Groups
    INSERT INTO [dbo].[PrimaryGroups] (
        PrimaryGroupCode, PrimaryGroupName, GroupID, AccountInfoID, 
        GroupType, NatureOfAccount, OpeningBalance, IsConfirmed, 
        IsActive, Remarks, CreatedBy
    )
    VALUES 
        ('PG001', 'Cash in Hand', 1, 1, 'Assets', 'Debit', 50000, 1, 1, 'Primary Group - Cash', 'Admin'),
        ('PG002', 'Bank Accounts', 1, 2, 'Assets', 'Debit', 200000, 1, 1, 'Primary Group - Bank', 'Admin'),
        ('PG003', 'Accounts Receivable', 2, 3, 'Assets', 'Debit', 150000, 0, 1, 'Primary Group - Debtors', 'Admin'),
        ('PG004', 'Inventory', 3, 4, 'Assets', 'Debit', 300000, 0, 1, 'Primary Group - Stock', 'Admin'),
        ('PG005', 'Accounts Payable', 4, 5, 'Liabilities', 'Credit', 100000, 0, 1, 'Primary Group - Creditors', 'Admin'),
        ('PG006', 'Bank Loans', 5, 6, 'Liabilities', 'Credit', 500000, 0, 1, 'Primary Group - Loans', 'Admin'),
        ('PG007', 'Sales Revenue', 6, 7, 'Income', 'Credit', 0, 0, 1, 'Primary Group - Sales', 'Admin'),
        ('PG008', 'Salary Expense', 7, 8, 'Expenses', 'Debit', 0, 0, 1, 'Primary Group - Salaries', 'Admin'),
        ('PG009', 'Capital Account', 8, 9, 'Equity', 'Credit', 1000000, 0, 1, 'Primary Group - Capital', 'Admin'),
        ('PG010', 'Retained Earnings', 8, 10, 'Equity', 'Credit', 250000, 0, 1, 'Primary Group - Retained', 'Admin');

END;
GO

-- Verify the table creation
SELECT 
    SCHEMA_NAME(schema_id) AS SchemaName,
    name AS TableName
FROM sys.objects 
WHERE type = 'U' 
AND name = 'PrimaryGroups';
GO

-- Display the table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'PrimaryGroups'
ORDER BY ORDINAL_POSITION;
GO

-- Show foreign key relationships
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    ref.name AS ReferencedTable
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables ref ON fk.referenced_object_id = ref.object_id
WHERE tp.name = 'PrimaryGroups';
GO

-- Show count of records inserted
SELECT 
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN IsConfirmed = 1 THEN 1 ELSE 0 END) AS ConfirmedRecords,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveRecords
FROM [dbo].[PrimaryGroups];
GO

-- Preview sample data with references
SELECT TOP 10 
    pg.PrimaryGroupID,
    pg.PrimaryGroupCode,
    pg.PrimaryGroupName,
    ag.GroupName AS AccountGroupName,
    ai.AccountName AS AccountInfoName,
    pg.GroupType,
    pg.NatureOfAccount,
    pg.OpeningBalance,
    CASE WHEN pg.IsConfirmed = 1 THEN 'Yes' ELSE 'No' END AS IsConfirmed,
    CASE WHEN pg.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS Status
FROM [dbo].[PrimaryGroups] pg
LEFT JOIN [dbo].[AccountGroups] ag ON pg.GroupID = ag.GroupID
LEFT JOIN [dbo].[AccountInfo] ai ON pg.AccountInfoID = ai.AccountInfoID
ORDER BY pg.PrimaryGroupID;
GO
