-- ============================================
-- Branches Table Creation Script for AccSmart
-- SQL Server 2008 R2 Compatible
-- ============================================

-- Check if table exists and drop it (optional - comment out if you want to keep existing data)
-- IF OBJECT_ID('Branches', 'U') IS NOT NULL
--     DROP TABLE Branches
-- GO

-- Create Branches table
CREATE TABLE Branches (
    BranchID INT IDENTITY(1,1) PRIMARY KEY,
    FirmID INT NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Address1 NVARCHAR(500) NULL,
    Address2 NVARCHAR(500) NULL,
    Place NVARCHAR(100) NULL,
    State NVARCHAR(100) NULL,
    Pincode NVARCHAR(20) NULL,
    Phone NVARCHAR(50) NULL,
    Mobile NVARCHAR(50) NULL,
    Email NVARCHAR(200) NULL,
    ContactPerson NVARCHAR(200) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'System',
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL
)
GO

-- Add foreign key constraint to Firms table
ALTER TABLE Branches
ADD CONSTRAINT FK_Branches_Firms
FOREIGN KEY (FirmID) REFERENCES Firms(FirmID)
ON DELETE CASCADE
ON UPDATE CASCADE
GO

-- Create index for faster queries
CREATE INDEX IX_Branches_FirmID ON Branches(FirmID)
GO
CREATE INDEX IX_Branches_Code ON Branches(Code)
GO
CREATE INDEX IX_Branches_IsActive ON Branches(IsActive)
GO

-- Create trigger to update ModifiedDate automatically
CREATE TRIGGER TR_Branches_UpdateModifiedDate
ON Branches
AFTER UPDATE
AS
BEGIN
    UPDATE Branches
    SET ModifiedDate = GETDATE()
    FROM Branches b
    INNER JOIN inserted i ON b.BranchID = i.BranchID
END
GO

-- Insert some sample data (optional - comment out if not needed)
-- INSERT INTO Branches (FirmID, Code, Name, Place, IsActive)
-- VALUES (1, 'BR001', 'Head Office', 'Mumbai', 1)
-- GO

-- View table structure
-- EXEC sp_help Branches
-- GO

-- View all branches with firm details
-- SELECT b.*, f.TradeName as FirmName
-- FROM Branches b
-- LEFT JOIN Firms f ON b.FirmID = f.FirmID
-- WHERE b.IsActive = 1
-- ORDER BY b.Code
-- GO

PRINT 'Branches table created successfully!'
GO
