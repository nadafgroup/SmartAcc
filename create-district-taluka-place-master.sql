-- ============================================
-- DISTRICT, TALUKA, PLACE MASTER TABLES
-- SQL Server 2008 R2 Compatible
-- ============================================

-- Drop existing tables if they exist (in reverse order to avoid FK conflicts)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Places]') AND type in (N'U'))
    DROP TABLE [dbo].[Places];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Talukas]') AND type in (N'U'))
    DROP TABLE [dbo].[Talukas];

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Districts]') AND type in (N'U'))
    DROP TABLE [dbo].[Districts];

-- ============================================
-- 1. STATE MASTER TABLE
-- ============================================
CREATE TABLE [dbo].[States] (
    [StateID] INT IDENTITY(1,1) NOT NULL,
    [StateCode] NVARCHAR(50) NOT NULL,
    [StateName] NVARCHAR(100) NOT NULL,
    [OpeningBalance] DECIMAL(18,2) NULL DEFAULT 0,
    [IsActive] BIT NULL DEFAULT 1,
    [IsConfirmed] BIT NULL DEFAULT 0,
    [Remarks] NVARCHAR(500) NULL,
    [CreatedDate] DATETIME NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME NULL DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(50) NULL,
    CONSTRAINT [PK_States] PRIMARY KEY CLUSTERED ([StateID] ASC)
);

-- Add unique constraint for StateCode
ALTER TABLE [dbo].[States] ADD CONSTRAINT [UQ_States_StateCode] UNIQUE ([StateCode]);

-- ============================================
-- 2. DISTRICT TABLE (references State)
-- ============================================
CREATE TABLE [dbo].[Districts] (
    [DistrictID] INT IDENTITY(1,1) NOT NULL,
    [DistrictCode] NVARCHAR(50) NOT NULL,
    [DistrictName] NVARCHAR(100) NOT NULL,
    [StateID] INT NULL,
    [OpeningBalance] DECIMAL(18,2) NULL DEFAULT 0,
    [IsActive] BIT NULL DEFAULT 1,
    [IsConfirmed] BIT NULL DEFAULT 0,
    [Remarks] NVARCHAR(500) NULL,
    [CreatedDate] DATETIME NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME NULL DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(50) NULL,
    CONSTRAINT [PK_Districts] PRIMARY KEY CLUSTERED ([DistrictID] ASC)
);

-- Add unique constraint for DistrictCode
ALTER TABLE [dbo].[Districts] ADD CONSTRAINT [UQ_Districts_DistrictCode] UNIQUE ([DistrictCode]);

-- Add foreign key to States
ALTER TABLE [dbo].[Districts] ADD CONSTRAINT [FK_Districts_States] 
    FOREIGN KEY ([StateID]) REFERENCES [dbo].[States]([StateID]);

-- ============================================
-- 3. TALUKA TABLE (references District)
-- ============================================
CREATE TABLE [dbo].[Talukas] (
    [TalukaID] INT IDENTITY(1,1) NOT NULL,
    [TalukaCode] NVARCHAR(50) NOT NULL,
    [TalukaName] NVARCHAR(100) NOT NULL,
    [DistrictID] INT NULL,
    [OpeningBalance] DECIMAL(18,2) NULL DEFAULT 0,
    [IsActive] BIT NULL DEFAULT 1,
    [IsConfirmed] BIT NULL DEFAULT 0,
    [Remarks] NVARCHAR(500) NULL,
    [CreatedDate] DATETIME NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME NULL DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(50) NULL,
    CONSTRAINT [PK_Talukas] PRIMARY KEY CLUSTERED ([TalukaID] ASC)
);

-- Add unique constraint for TalukaCode
ALTER TABLE [dbo].[Talukas] ADD CONSTRAINT [UQ_Talukas_TalukaCode] UNIQUE ([TalukaCode]);

-- Add foreign key to Districts
ALTER TABLE [dbo].[Talukas] ADD CONSTRAINT [FK_Talukas_Districts] 
    FOREIGN KEY ([DistrictID]) REFERENCES [dbo].[Districts]([DistrictID]);

-- ============================================
-- 4. PLACE TABLE (references Taluka and District)
-- ============================================
CREATE TABLE [dbo].[Places] (
    [PlaceID] INT IDENTITY(1,1) NOT NULL,
    [PlaceCode] NVARCHAR(50) NOT NULL,
    [PlaceName] NVARCHAR(100) NOT NULL,
    [TalukaID] INT NULL,
    [DistrictID] INT NULL,
    [Pincode] NVARCHAR(10) NULL,
    [OpeningBalance] DECIMAL(18,2) NULL DEFAULT 0,
    [IsActive] BIT NULL DEFAULT 1,
    [IsConfirmed] BIT NULL DEFAULT 0,
    [Remarks] NVARCHAR(500) NULL,
    [CreatedDate] DATETIME NULL DEFAULT GETDATE(),
    [ModifiedDate] DATETIME NULL DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(50) NULL,
    CONSTRAINT [PK_Places] PRIMARY KEY CLUSTERED ([PlaceID] ASC)
);

-- Add unique constraint for PlaceCode
ALTER TABLE [dbo].[Places] ADD CONSTRAINT [UQ_Places_PlaceCode] UNIQUE ([PlaceCode]);

-- Add foreign key to Talukas
ALTER TABLE [dbo].[Places] ADD CONSTRAINT [FK_Places_Talukas] 
    FOREIGN KEY ([TalukaID]) REFERENCES [dbo].[Talukas]([TalukaID]);

-- Add foreign key to Districts
ALTER TABLE [dbo].[Places] ADD CONSTRAINT [FK_Places_Districts] 
    FOREIGN KEY ([DistrictID]) REFERENCES [dbo].[Districts]([DistrictID]);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE NONCLUSTERED INDEX [IX_Districts_StateID] ON [dbo].[Districts] ([StateID]);
CREATE NONCLUSTERED INDEX [IX_Districts_IsActive] ON [dbo].[Districts] ([IsActive]);
CREATE NONCLUSTERED INDEX [IX_Talukas_DistrictID] ON [dbo].[Talukas] ([DistrictID]);
CREATE NONCLUSTERED INDEX [IX_Talukas_IsActive] ON [dbo].[Talukas] ([IsActive]);
CREATE NONCLUSTERED INDEX [IX_Places_TalukaID] ON [dbo].[Places] ([TalukaID]);
CREATE NONCLUSTERED INDEX [IX_Places_DistrictID] ON [dbo].[Places] ([DistrictID]);
CREATE NONCLUSTERED INDEX [IX_Places_IsActive] ON [dbo].[Places] ([IsActive]);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert States
INSERT INTO [dbo].[States] (StateCode, StateName, IsActive) VALUES ('ST001', 'Maharashtra', 1);
INSERT INTO [dbo].[States] (StateCode, StateName, IsActive) VALUES ('ST002', 'Gujarat', 1);
INSERT INTO [dbo].[States] (StateCode, StateName, IsActive) VALUES ('ST003', 'Rajasthan', 1);

-- Insert Districts (with StateID references)
INSERT INTO [dbo].[Districts] (DistrictCode, DistrictName, StateID, IsActive) 
VALUES ('DIST001', 'Mumbai City', 1, 1);
INSERT INTO [dbo].[Districts] (DistrictCode, DistrictName, StateID, IsActive) 
VALUES ('DIST002', 'Mumbai Suburban', 1, 1);
INSERT INTO [dbo].[Districts] (DistrictCode, DistrictName, StateID, IsActive) 
VALUES ('DIST003', 'Thane', 1, 1);
INSERT INTO [dbo].[Districts] (DistrictCode, DistrictName, StateID, IsActive) 
VALUES ('DIST004', 'Ahmedabad', 2, 1);
INSERT INTO [dbo].[Districts] (DistrictCode, DistrictName, StateID, IsActive) 
VALUES ('DIST005', 'Jaipur', 3, 1);

-- Insert Talukas (with DistrictID references)
INSERT INTO [dbo].[Talukas] (TalukaCode, TalukaName, DistrictID, IsActive) 
VALUES ('TALU001', 'Andheri', 1, 1);
INSERT INTO [dbo].[Talukas] (TalukaCode, TalukaName, DistrictID, IsActive) 
VALUES ('TALU002', 'Bandra', 1, 1);
INSERT INTO [dbo].[Talukas] (TalukaCode, TalukaName, DistrictID, IsActive) 
VALUES ('TALU003', 'Thane City', 3, 1);
INSERT INTO [dbo].[Talukas] (TalukaCode, TalukaName, DistrictID, IsActive) 
VALUES ('TALU004', 'Ahmedabad City', 4, 1);
INSERT INTO [dbo].[Talukas] (TalukaCode, TalukaName, DistrictID, IsActive) 
VALUES ('TALU005', 'Jaipur City', 5, 1);

-- Insert Places (with TalukaID and DistrictID references)
INSERT INTO [dbo].[Places] (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
VALUES ('PLACE001', 'Andheri East', 1, 1, '400093', 1);
INSERT INTO [dbo].[Places] (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
VALUES ('PLACE002', 'Andheri West', 1, 1, '400058', 1);
INSERT INTO [dbo].[Places] (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
VALUES ('PLACE003', 'Bandra West', 2, 1, '400050', 1);
INSERT INTO [dbo].[Places] (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
VALUES ('PLACE004', 'Thane West', 3, 3, '400601', 1);
INSERT INTO [dbo].[Places] (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
VALUES ('PLACE005', 'Ahmedabad East', 4, 4, '380001', 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify State-District relationship
-- SELECT s.StateName, d.DistrictName 
-- FROM Districts d INNER JOIN States s ON d.StateID = s.StateID;

-- Verify District-Taluka relationship
-- SELECT d.DistrictName, t.TalukaName 
-- FROM Talukas t INNER JOIN Districts d ON t.DistrictID = d.DistrictID;

-- Verify Taluka-Place relationship with District
-- SELECT t.TalukaName, p.PlaceName, d.DistrictName
-- FROM Places p 
-- INNER JOIN Talukas t ON p.TalukaID = t.TalukaID
-- INNER JOIN Districts d ON p.DistrictID = d.DistrictID;

PRINT 'Tables created successfully!';
GO
