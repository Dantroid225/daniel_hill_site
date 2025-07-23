-- Stored Procedures for Enhanced Security and Performance

-- Get all published portfolio items
DELIMITER //
CREATE PROCEDURE GetPublishedPortfolioItems()
BEGIN
    SELECT * FROM portfolio_items 
    WHERE status = 'published' 
    ORDER BY display_order ASC, created_at DESC;
END //
DELIMITER ;

-- Get all portfolio items (admin)
DELIMITER //
CREATE PROCEDURE GetAllPortfolioItems()
BEGIN
    SELECT * FROM portfolio_items 
    ORDER BY display_order ASC, created_at DESC;
END //
DELIMITER ;

-- Get portfolio item by ID
DELIMITER //
CREATE PROCEDURE GetPortfolioItemById(IN item_id INT)
BEGIN
    SELECT * FROM portfolio_items WHERE id = item_id;
END //
DELIMITER ;

-- Create new portfolio item
DELIMITER //
CREATE PROCEDURE CreatePortfolioItem(
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
    
    -- Get next display order
    SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_order 
    FROM portfolio_items;
    
    INSERT INTO portfolio_items (
        title, description, image_url, project_url, 
        technologies, category, display_order, status, featured
    ) VALUES (
        p_title, p_description, p_image_url, p_project_url,
        p_technologies, p_category, next_order, p_status, p_featured
    );
    
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

-- Update portfolio item
DELIMITER //
CREATE PROCEDURE UpdatePortfolioItem(
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
    SET title = p_title,
        description = p_description,
        image_url = p_image_url,
        project_url = p_project_url,
        technologies = p_technologies,
        category = p_category,
        status = p_status,
        featured = p_featured,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Delete portfolio item
DELIMITER //
CREATE PROCEDURE DeletePortfolioItem(IN p_id INT)
BEGIN
    DELETE FROM portfolio_items WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Reorder portfolio items
DELIMITER //
CREATE PROCEDURE ReorderPortfolioItems(IN p_items JSON)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE item_count INT;
    DECLARE current_item JSON;
    
    SET item_count = JSON_LENGTH(p_items);
    
    -- Start transaction
    START TRANSACTION;
    
    WHILE i < item_count DO
        SET current_item = JSON_EXTRACT(p_items, CONCAT('$[', i, ']'));
        
        UPDATE portfolio_items 
        SET display_order = JSON_EXTRACT(current_item, '$.display_order')
        WHERE id = JSON_EXTRACT(current_item, '$.id');
        
        SET i = i + 1;
    END WHILE;
    
    COMMIT;
END //
DELIMITER ;

-- Toggle featured status
DELIMITER //
CREATE PROCEDURE ToggleFeaturedStatus(IN p_id INT)
BEGIN
    UPDATE portfolio_items 
    SET featured = NOT featured, updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Update status
DELIMITER //
CREATE PROCEDURE UpdatePortfolioStatus(
    IN p_id INT,
    IN p_status ENUM('draft', 'published', 'archived')
)
BEGIN
    UPDATE portfolio_items 
    SET status = p_status, updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Get user by email (for authentication)
DELIMITER //
CREATE PROCEDURE GetUserByEmail(IN p_email VARCHAR(255))
BEGIN
    SELECT * FROM users WHERE email = p_email;
END //
DELIMITER ;

-- Create new user
DELIMITER //
CREATE PROCEDURE CreateUser(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_role ENUM('admin', 'user')
)
BEGIN
    INSERT INTO users (name, email, password, role)
    VALUES (p_name, p_email, p_password, p_role);
    
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

-- Create contact inquiry
DELIMITER //
CREATE PROCEDURE CreateContactInquiry(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_subject VARCHAR(255),
    IN p_message TEXT
)
BEGIN
    INSERT INTO contact_inquiries (name, email, subject, message)
    VALUES (p_name, p_email, p_subject, p_message);
    
    SELECT LAST_INSERT_ID() as id;
END //
DELIMITER ;

-- Get all contact inquiries (admin)
DELIMITER //
CREATE PROCEDURE GetAllContactInquiries()
BEGIN
    SELECT * FROM contact_inquiries 
    ORDER BY created_at DESC;
END //
DELIMITER ;

-- Update contact inquiry status
DELIMITER //
CREATE PROCEDURE UpdateContactStatus(
    IN p_id INT,
    IN p_status ENUM('new', 'read', 'replied', 'closed')
)
BEGIN
    UPDATE contact_inquiries 
    SET status = p_status, updated_at = NOW()
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END //
DELIMITER ;

-- Input validation function
DELIMITER //
CREATE FUNCTION ValidateEmail(p_email VARCHAR(255)) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE valid BOOLEAN DEFAULT FALSE;
    
    -- Basic email validation
    IF p_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        SET valid = TRUE;
    END IF;
    
    RETURN valid;
END //
DELIMITER ;

-- Sanitize input function
DELIMITER //
CREATE FUNCTION SanitizeInput(p_input TEXT) 
RETURNS TEXT
DETERMINISTIC
BEGIN
    DECLARE sanitized TEXT;
    
    -- Remove potentially dangerous characters
    SET sanitized = REPLACE(p_input, '<script', '');
    SET sanitized = REPLACE(sanitized, '</script>', '');
    SET sanitized = REPLACE(sanitized, 'javascript:', '');
    SET sanitized = REPLACE(sanitized, 'onload=', '');
    SET sanitized = REPLACE(sanitized, 'onerror=', '');
    
    RETURN sanitized;
END //
DELIMITER ; 