-- Add IsConfirmed / ConfirmedDate columns to Branches, FinancialYears and Products
-- so the toolbar Confirm flow works consistently across all master pages.
-- Each batch is separated by GO. The backfill UPDATE is wrapped in dynamic SQL
-- (EXEC) so the column reference resolves at execution time.

-- Branches
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[Branches]'))
BEGIN
    ALTER TABLE Branches ADD IsConfirmed BIT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[Branches]'))
BEGIN
    ALTER TABLE Branches ADD ConfirmedDate DATETIME NULL
END
GO

EXEC('UPDATE Branches SET IsConfirmed = 0 WHERE IsConfirmed IS NULL')
GO

-- FinancialYears
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[FinancialYears]'))
BEGIN
    ALTER TABLE FinancialYears ADD IsConfirmed BIT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[FinancialYears]'))
BEGIN
    ALTER TABLE FinancialYears ADD ConfirmedDate DATETIME NULL
END
GO

EXEC('UPDATE FinancialYears SET IsConfirmed = 0 WHERE IsConfirmed IS NULL')
GO

-- Products
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[Products]'))
BEGIN
    ALTER TABLE Products ADD IsConfirmed BIT NULL DEFAULT 0
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[Products]'))
BEGIN
    ALTER TABLE Products ADD ConfirmedDate DATETIME NULL
END
GO

EXEC('UPDATE Products SET IsConfirmed = 0 WHERE IsConfirmed IS NULL')
GO

PRINT 'IsConfirmed columns added to Branches, FinancialYears and Products!'
