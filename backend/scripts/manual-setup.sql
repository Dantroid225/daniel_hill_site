-- Manual Setup Script for Stored Procedures
-- Run this directly in MySQL if automated setup fails

USE dh_portfolio;

-- Get portfolio items by category (for Art Show)
CREATE OR REPLACE PROCEDURE GetPortfolioItemsByCategory(IN p_category VARCHAR(100))
SELECT * FROM portfolio_items 
WHERE status = 'published' AND category = p_category
ORDER BY display_order ASC, created_at DESC;

-- Get all published portfolio items
CREATE OR REPLACE PROCEDURE GetPublishedPortfolioItems()
SELECT * FROM portfolio_items 
WHERE status = 'published' 
ORDER BY display_order ASC, created_at DESC;

-- Get all portfolio items (admin)
CREATE OR REPLACE PROCEDURE GetAllPortfolioItems()
SELECT * FROM portfolio_items 
ORDER BY display_order ASC, created_at DESC;

-- Get portfolio item by ID
CREATE OR REPLACE PROCEDURE GetPortfolioItemById(IN item_id INT)
SELECT * FROM portfolio_items WHERE id = item_id;

-- Create new portfolio item
CREATE OR REPLACE PROCEDURE CreatePortfolioItem(
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_image_url VARCHAR(500),
    IN p_project_url VARCHAR(500),
    IN p_technologies JSON,
    IN p_category VARCHAR(100),
    IN p_status ENUM('draft', 'published', 'archived'),
    IN p_featured BOOLEAN
)
BEGIN
    DECLARE next_order INT;
    SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_order FROM portfolio_items;
    INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order, status, featured) 
    VALUES (p_title, p_description, p_image_url, p_project_url, p_technologies, p_category, next_order, p_status, p_featured);
    SELECT LAST_INSERT_ID() as id;
END;

-- Update portfolio item
CREATE OR REPLACE PROCEDURE UpdatePortfolioItem(
    IN p_id INT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_image_url VARCHAR(500),
    IN p_project_url VARCHAR(500),
    IN p_technologies JSON,
    IN p_category VARCHAR(100),
    IN p_status ENUM('draft', 'published', 'archived'),
    IN p_featured BOOLEAN
)
BEGIN
    UPDATE portfolio_items 
    SET title = p_title, description = p_description, image_url = p_image_url, 
        project_url = p_project_url, technologies = p_technologies, category = p_category, 
        status = p_status, featured = p_featured, updated_at = NOW()
    WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Delete portfolio item
CREATE OR REPLACE PROCEDURE DeletePortfolioItem(IN p_id INT)
DELETE FROM portfolio_items WHERE id = p_id;

-- Toggle featured status
CREATE OR REPLACE PROCEDURE ToggleFeaturedStatus(IN p_id INT)
BEGIN
    UPDATE portfolio_items SET featured = NOT featured, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Update status
CREATE OR REPLACE PROCEDURE UpdatePortfolioStatus(IN p_id INT, IN p_status ENUM('draft', 'published', 'archived'))
BEGIN
    UPDATE portfolio_items SET status = p_status, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Get user by email
CREATE OR REPLACE PROCEDURE GetUserByEmail(IN p_email VARCHAR(255))
SELECT * FROM users WHERE email = p_email;

-- Create new user
CREATE OR REPLACE PROCEDURE CreateUser(IN p_name VARCHAR(255), IN p_email VARCHAR(255), IN p_password VARCHAR(255), IN p_role ENUM('admin', 'user'))
BEGIN
    INSERT INTO users (name, email, password, role) VALUES (p_name, p_email, p_password, p_role);
    SELECT LAST_INSERT_ID() as id;
END;

-- Create contact inquiry
CREATE OR REPLACE PROCEDURE CreateContactInquiry(IN p_name VARCHAR(255), IN p_email VARCHAR(255), IN p_subject VARCHAR(255), IN p_message TEXT)
BEGIN
    INSERT INTO contact_inquiries (name, email, subject, message) VALUES (p_name, p_email, p_subject, p_message);
    SELECT LAST_INSERT_ID() as id;
END;

-- Get all contact inquiries
CREATE OR REPLACE PROCEDURE GetAllContactInquiries()
SELECT * FROM contact_inquiries ORDER BY created_at DESC;

-- Update contact status
CREATE OR REPLACE PROCEDURE UpdateContactStatus(IN p_id INT, IN p_status ENUM('new', 'read', 'replied', 'closed'))
BEGIN
    UPDATE contact_inquiries SET status = p_status, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Verify procedures were created
SHOW PROCEDURE STATUS WHERE Db = 'dh_portfolio'; 