-- Add missing columns to Users table to support User Management toolbar
-- (UserCode, Phone, Mobile, Department, Designation, Address, City, State, Pincode,
--  IsLocked, IsConfirmed, CreatedBy, ModifiedDate, ConfirmedDate)

-- UserCode
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'UserCode' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD UserCode NVARCHAR(50) NULL
END

-- Phone
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Phone' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Phone NVARCHAR(20) NULL
END

-- Mobile
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Mobile' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Mobile NVARCHAR(20) NULL
END

-- Department
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Department' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Department NVARCHAR(50) NULL
END

-- Designation
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Designation' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Designation NVARCHAR(50) NULL
END

-- Address
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Address' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Address NVARCHAR(255) NULL
END

-- City
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'City' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD City NVARCHAR(50) NULL
END

-- State
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'State' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD State NVARCHAR(50) NULL
END

-- Pincode
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Pincode' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Pincode NVARCHAR(10) NULL
END

-- IsLocked
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsLocked' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD IsLocked BIT NULL DEFAULT 0
END

-- IsConfirmed
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsConfirmed' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD IsConfirmed BIT NULL DEFAULT 0
END

-- ConfirmedDate
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ConfirmedDate' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD ConfirmedDate DATETIME NULL
END

-- CreatedBy
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD CreatedBy NVARCHAR(50) NULL
END

-- Remarks
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'Remarks' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD Remarks NVARCHAR(255) NULL
END

-- ModifiedDate
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'ModifiedDate' AND Object_ID = Object_ID(N'[dbo].[Users]'))
BEGIN
    ALTER TABLE Users ADD ModifiedDate DATETIME NULL
END

-- Backfill NULLs to safe defaults
UPDATE Users SET IsLocked = 0 WHERE IsLocked IS NULL
UPDATE Users SET IsConfirmed = 0 WHERE IsConfirmed IS NULL
UPDATE Users SET IsActive = 1 WHERE IsActive IS NULL

-- Generate UserCode for existing rows that do not have one
UPDATE Users
SET UserCode = 'USR' + RIGHT('000' + CAST(UserID AS NVARCHAR(10)), 3)
WHERE UserCode IS NULL OR UserCode = ''

PRINT '✅ Users table columns added successfully!'
