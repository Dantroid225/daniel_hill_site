-- Minimal Setup Script for Stored Procedures
-- Compatible with all MySQL versions

USE dh_portfolio;

-- Get portfolio items by category (for Art Show)
DROP PROCEDURE IF EXISTS GetPortfolioItemsByCategory;
CREATE PROCEDURE GetPortfolioItemsByCategory(IN p_category VARCHAR(100))
SELECT * FROM portfolio_items 
WHERE status = 'published' AND category = p_category
ORDER BY display_order ASC, created_at DESC;

-- Get all published portfolio items
DROP PROCEDURE IF EXISTS GetPublishedPortfolioItems;
CREATE PROCEDURE GetPublishedPortfolioItems()
SELECT * FROM portfolio_items 
WHERE status = 'published' 
ORDER BY display_order ASC, created_at DESC;

-- Get all portfolio items (admin)
DROP PROCEDURE IF EXISTS GetAllPortfolioItems;
CREATE PROCEDURE GetAllPortfolioItems()
SELECT * FROM portfolio_items 
ORDER BY display_order ASC, created_at DESC;

-- Get portfolio item by ID
DROP PROCEDURE IF EXISTS GetPortfolioItemById;
CREATE PROCEDURE GetPortfolioItemById(IN item_id INT)
SELECT * FROM portfolio_items WHERE id = item_id;

-- Create new portfolio item (simplified)
DROP PROCEDURE IF EXISTS CreatePortfolioItem;
CREATE PROCEDURE CreatePortfolioItem(
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_image_url VARCHAR(500),
    IN p_project_url VARCHAR(500),
    IN p_technologies TEXT,
    IN p_category VARCHAR(100),
    IN p_status VARCHAR(20),
    IN p_featured TINYINT
)
BEGIN
    DECLARE next_order INT;
    SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_order FROM portfolio_items;
    INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order, status, featured) 
    VALUES (p_title, p_description, p_image_url, p_project_url, p_technologies, p_category, next_order, p_status, p_featured);
    SELECT LAST_INSERT_ID() as id;
END;

-- Update portfolio item (simplified)
DROP PROCEDURE IF EXISTS UpdatePortfolioItem;
CREATE PROCEDURE UpdatePortfolioItem(
    IN p_id INT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_image_url VARCHAR(500),
    IN p_project_url VARCHAR(500),
    IN p_technologies TEXT,
    IN p_category VARCHAR(100),
    IN p_status VARCHAR(20),
    IN p_featured TINYINT
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
DROP PROCEDURE IF EXISTS DeletePortfolioItem;
CREATE PROCEDURE DeletePortfolioItem(IN p_id INT)
DELETE FROM portfolio_items WHERE id = p_id;

-- Toggle featured status
DROP PROCEDURE IF EXISTS ToggleFeaturedStatus;
CREATE PROCEDURE ToggleFeaturedStatus(IN p_id INT)
BEGIN
    UPDATE portfolio_items SET featured = NOT featured, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Update status
DROP PROCEDURE IF EXISTS UpdatePortfolioStatus;
CREATE PROCEDURE UpdatePortfolioStatus(IN p_id INT, IN p_status VARCHAR(20))
BEGIN
    UPDATE portfolio_items SET status = p_status, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Get user by email
DROP PROCEDURE IF EXISTS GetUserByEmail;
CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(255))
SELECT * FROM users WHERE email = p_email;

-- Create new user
DROP PROCEDURE IF EXISTS CreateUser;
CREATE PROCEDURE CreateUser(IN p_name VARCHAR(255), IN p_email VARCHAR(255), IN p_password VARCHAR(255), IN p_role VARCHAR(20))
BEGIN
    INSERT INTO users (name, email, password, role) VALUES (p_name, p_email, p_password, p_role);
    SELECT LAST_INSERT_ID() as id;
END;

-- Create contact inquiry
DROP PROCEDURE IF EXISTS CreateContactInquiry;
CREATE PROCEDURE CreateContactInquiry(IN p_name VARCHAR(255), IN p_email VARCHAR(255), IN p_subject VARCHAR(255), IN p_message TEXT)
BEGIN
    INSERT INTO contact_inquiries (name, email, subject, message) VALUES (p_name, p_email, p_subject, p_message);
    SELECT LAST_INSERT_ID() as id;
END;

-- Get all contact inquiries
DROP PROCEDURE IF EXISTS GetAllContactInquiries;
CREATE PROCEDURE GetAllContactInquiries()
SELECT * FROM contact_inquiries ORDER BY created_at DESC;

-- Update contact status
DROP PROCEDURE IF EXISTS UpdateContactStatus;
CREATE PROCEDURE UpdateContactStatus(IN p_id INT, IN p_status VARCHAR(20))
BEGIN
    UPDATE contact_inquiries SET status = p_status, updated_at = NOW() WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END;

-- Verify procedures were created
SHOW PROCEDURE STATUS WHERE Db = 'dh_portfolio'; 