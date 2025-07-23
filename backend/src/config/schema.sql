-- Create database if not exists
CREATE DATABASE IF NOT EXISTS dh_portfolio;
USE dh_portfolio;

-- Users table with role-based authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Portfolio items table with enhanced project management
CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  project_url VARCHAR(500),
  technologies JSON,
  category VARCHAR(100),
  display_order INT DEFAULT 0,
  status ENUM('draft', 'published', 'archived') DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_portfolio_order ON portfolio_items(display_order, status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Insert sample portfolio data
INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order, featured) VALUES
('Sample Project 1', 'A sample portfolio project description', '/uploads/images/image-1753244077780-587641624_optimized.jpg', 'https://github.com/sample/project1', '["React", "Node.js", "MySQL"]', 'Web Development', 1, true),
('Sample Project 2', 'Another sample portfolio project', '/uploads/images/image-1753244077780-587641624.gif', 'https://github.com/sample/project2', '["Vue.js", "Express", "MongoDB"]', 'Full Stack', 2, false),
('Digital Abstract Composition', 'A vibrant digital artwork exploring color theory and geometric patterns', '/uploads/images/art-abstract.jpg', 'https://artstation.com/abstract-composition', '["Photoshop", "Digital Art", "Color Theory"]', 'art', 3, true),
('Pixel Art Character Design', 'A detailed pixel art character created with modern digital techniques', '/uploads/images/art-pixel.jpg', 'https://deviantart.com/pixel-character', '["Aseprite", "Pixel Art", "Character Design"]', 'art', 4, false),
('3D Sculpture Study', 'A digital 3D sculpture exploring form and texture', '/uploads/images/art-3d.jpg', 'https://sketchfab.com/3d-sculpture', '["Blender", "3D Modeling", "Sculpture"]', 'art', 5, true);

-- Note: Admin user will be created via the setup script with proper password hashing
-- Run: npm run setup 