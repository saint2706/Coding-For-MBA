-- 💻 Exercises: Day 100 (Solutions)

-- Since SQLite does not support stored procedures, these are example solutions for SQL Server.

-- Get all employees in a specific department.
CREATE PROCEDURE GetEmployeesByDepartment @DepartmentName nvarchar(50)
AS
BEGIN
    SELECT *
    FROM Employees e
    INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
    WHERE d.DepartmentName = @DepartmentName;
END;

-- Add a new customer to the customers table.
CREATE PROCEDURE AddCustomer @CustomerName nvarchar(50), @Country nvarchar(50)
AS
BEGIN
    INSERT INTO Customers (CustomerName, Country)
    VALUES (@CustomerName, @Country);
END;

-- Update the price of a product.
CREATE PROCEDURE UpdateProductPrice @ProductID int, @NewPrice decimal(18, 2)
AS
BEGIN
    UPDATE Products
    SET Price = @NewPrice
    WHERE ProductID = @ProductID;
END;
