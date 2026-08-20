-- Add IsConfirmed and ConfirmedDate columns to AccountGroups table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[AccountGroups]'))
BEGIN
    ALTER TABLE AccountGroups ADD IsConfirmed BIT NULL DEFAULT 0
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[AccountGroups]'))
BEGIN
    ALTER TABLE AccountGroups ADD ConfirmedDate DATETIME NULL
END

-- Update existing records to have IsConfirmed = 0 where NULL
UPDATE AccountGroups SET IsConfirmed = 0 WHERE IsConfirmed IS NULL

-- Add columns to AccountInfo table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[AccountInfo]'))
BEGIN
    ALTER TABLE AccountInfo ADD IsConfirmed BIT NULL DEFAULT 0
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[AccountInfo]'))
BEGIN
    ALTER TABLE AccountInfo ADD ConfirmedDate DATETIME NULL
END

-- Update existing records to have IsConfirmed = 0 where NULL
UPDATE AccountInfo SET IsConfirmed = 0 WHERE IsConfirmed IS NULL

-- Add columns to Firms table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[Firms]'))
BEGIN
    ALTER TABLE Firms ADD IsConfirmed BIT NULL DEFAULT 0
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[Firms]'))
BEGIN
    ALTER TABLE Firms ADD ConfirmedDate DATETIME NULL
END

-- Update existing records to have IsConfirmed = 0 where NULL
UPDATE Firms SET IsConfirmed = 0 WHERE IsConfirmed IS NULL

PRINT '✅ Columns added successfully!'