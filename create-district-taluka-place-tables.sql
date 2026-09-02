-- ============================================
-- DISTRICT, TALUKA, PLACE MASTER TABLES
-- ============================================

-- 1. DISTRICT TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Districts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Districts] (
        [DistrictID] INT IDENTITY(1,1) PRIMARY KEY,
        [DistrictCode] NVARCHAR(50) NOT NULL UNIQUE,
        [DistrictName] NVARCHAR(100) NOT NULL,
        [StateName] NVARCHAR(100) NULL,
        [OpeningBalance] DECIMAL(18,2) DEFAULT 0,
        [IsActive] BIT DEFAULT 1,
        [IsConfirmed] BIT DEFAULT 0,
        [Remarks] NVARCHAR(500) NULL,
        [CreatedDate] DATETIME DEFAULT GETDATE(),
        [ModifiedDate] DATETIME DEFAULT GETDATE(),
        [CreatedBy] NVARCHAR(50) NULL
    );
    PRINT 'Districts table created successfully.';
END
ELSE
BEGIN
    PRINT 'Districts table already exists.';
END
GO

-- 2. TALUKA TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Talukas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Talukas] (
        [TalukaID] INT IDENTITY(1,1) PRIMARY KEY,
        [TalukaCode] NVARCHAR(50) NOT NULL UNIQUE,
        [TalukaName] NVARCHAR(100) NOT NULL,
        [DistrictID] INT NULL,
        [OpeningBalance] DECIMAL(18,2) DEFAULT 0,
        [IsActive] BIT DEFAULT 1,
        [IsConfirmed] BIT DEFAULT 0,
        [Remarks] NVARCHAR(500) NULL,
        [CreatedDate] DATETIME DEFAULT GETDATE(),
        [ModifiedDate] DATETIME DEFAULT GETDATE(),
        [CreatedBy] NVARCHAR(50) NULL,
        CONSTRAINT FK_Talukas_Districts FOREIGN KEY (DistrictID) REFERENCES Districts(DistrictID) ON DELETE SET NULL
    );
    PRINT 'Talukas table created successfully.';
END
ELSE
BEGIN
    PRINT 'Talukas table already exists.';
END
GO

-- 3. PLACE TABLE
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Places]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Places] (
        [PlaceID] INT IDENTITY(1,1) PRIMARY KEY,
        [PlaceCode] NVARCHAR(50) NOT NULL UNIQUE,
        [PlaceName] NVARCHAR(100) NOT NULL,
        [TalukaID] INT NULL,
        [DistrictID] INT NULL,
        [Pincode] NVARCHAR(10) NULL,
        [OpeningBalance] DECIMAL(18,2) DEFAULT 0,
        [IsActive] BIT DEFAULT 1,
        [IsConfirmed] BIT DEFAULT 0,
        [Remarks] NVARCHAR(500) NULL,
        [CreatedDate] DATETIME DEFAULT GETDATE(),
        [ModifiedDate] DATETIME DEFAULT GETDATE(),
        [CreatedBy] NVARCHAR(50) NULL,
        CONSTRAINT FK_Places_Talukas FOREIGN KEY (TalukaID) REFERENCES Talukas(TalukaID) ON DELETE SET NULL,
        CONSTRAINT FK_Places_Districts FOREIGN KEY (DistrictID) REFERENCES Districts(DistrictID) ON DELETE SET NULL
    );
    PRINT 'Places table created successfully.';
END
ELSE
BEGIN
    PRINT 'Places table already exists.';
END
GO

-- Add index for better performance
CREATE INDEX IX_Districts_IsActive ON Districts(IsActive);
CREATE INDEX IX_Talukas_IsActive ON Talukas(IsActive);
CREATE INDEX IX_Talukas_DistrictID ON Talukas(DistrictID);
CREATE INDEX IX_Places_IsActive ON Places(IsActive);
CREATE INDEX IX_Places_TalukaID ON Places(TalukaID);
CREATE INDEX IX_Places_DistrictID ON Places(DistrictID);
PRINT 'Indexes created successfully.';
GO

-- Insert sample data for testing
INSERT INTO Districts (DistrictCode, DistrictName, StateName, IsActive) 
SELECT 'DIST001', 'Mumbai City', 'Maharashtra', 1
WHERE NOT EXISTS (SELECT 1 FROM Districts WHERE DistrictCode = 'DIST001');

INSERT INTO Districts (DistrictCode, DistrictName, StateName, IsActive) 
SELECT 'DIST002', 'Mumbai Suburban', 'Maharashtra', 1
WHERE NOT EXISTS (SELECT 1 FROM Districts WHERE DistrictCode = 'DIST002');

INSERT INTO Districts (DistrictCode, DistrictName, StateName, IsActive) 
SELECT 'DIST003', 'Thane', 'Maharashtra', 1
WHERE NOT EXISTS (SELECT 1 FROM Districts WHERE DistrictCode = 'DIST003');

INSERT INTO Talukas (TalukaCode, TalukaName, DistrictID, IsActive) 
SELECT 'TALU001', 'Andheri', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM Talukas WHERE TalukaCode = 'TALU001');

INSERT INTO Talukas (TalukaCode, TalukaName, DistrictID, IsActive) 
SELECT 'TALU002', 'Bandra', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM Talukas WHERE TalukaCode = 'TALU002');

INSERT INTO Talukas (TalukaCode, TalukaName, DistrictID, IsActive) 
SELECT 'TALU003', 'Thane City', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM Talukas WHERE TalukaCode = 'TALU003');

INSERT INTO Places (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
SELECT 'PLACE001', 'Andheri East', 1, 1, '400093', 1
WHERE NOT EXISTS (SELECT 1 FROM Places WHERE PlaceCode = 'PLACE001');

INSERT INTO Places (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
SELECT 'PLACE002', 'Bandra West', 2, 1, '400050', 1
WHERE NOT EXISTS (SELECT 1 FROM Places WHERE PlaceCode = 'PLACE002');

INSERT INTO Places (PlaceCode, PlaceName, TalukaID, DistrictID, Pincode, IsActive) 
SELECT 'PLACE003', 'Thane West', 3, 3, '400601', 1
WHERE NOT EXISTS (SELECT 1 FROM Places WHERE PlaceCode = 'PLACE003');

PRINT 'Sample data inserted successfully.';
GO
