const { pool } = require('../config/database');
const { sendResponse } = require('../utils/responseHelper');
const {
  validatePortfolioItem,
  sanitizeInput,
  validateFileUpload,
} = require('../utils/validation');
const fs = require('fs');
const path = require('path');

// Utility function to archive an image file
const archiveImage = imageUrl => {
  if (!imageUrl || imageUrl === '/uploads/images/default.jpg') {
    return;
  }

  const imagePath = path.join(__dirname, '../../', imageUrl);
  if (!fs.existsSync(imagePath)) {
    return;
  }

  try {
    // Create archived directory if it doesn't exist
    const archivedDir = path.join(__dirname, '../../uploads/archived');
    if (!fs.existsSync(archivedDir)) {
      fs.mkdirSync(archivedDir, { recursive: true });
    }

    // Generate archived filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const originalFilename = path.basename(imageUrl);
    const archivedFilename = `archived-${timestamp}-${originalFilename}`;
    const archivedPath = path.join(archivedDir, archivedFilename);

    // Move file to archived folder
    fs.renameSync(imagePath, archivedPath);
    console.log(`Image moved to archived folder: ${archivedPath}`);
  } catch (error) {
    console.error('Error archiving image:', error);
  }
};

const portfolioController = {
  // Get all portfolio items (public)
  getAllPortfolioItems: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM portfolio_items WHERE status = "published" ORDER BY display_order ASC, created_at DESC'
      );
      return sendResponse(
        res,
        200,
        true,
        'Portfolio items retrieved successfully',
        rows
      );
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      return sendResponse(res, 500, false, 'Failed to fetch portfolio items');
    }
  },

  // Get all items (admin version with more details)
  getAllItems: async (req, res) => {
    try {
      const [items] = await pool.execute(
        'SELECT * FROM portfolio_items ORDER BY display_order ASC, created_at DESC'
      );

      return sendResponse(
        res,
        200,
        true,
        'Portfolio items retrieved successfully',
        items
      );
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      return sendResponse(res, 500, false, 'Failed to fetch portfolio items');
    }
  },

  // Get portfolio item by ID
  getPortfolioItemById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        'SELECT * FROM portfolio_items WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }

      return sendResponse(
        res,
        200,
        true,
        'Portfolio item retrieved successfully',
        rows[0]
      );
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to fetch portfolio item');
    }
  },

  // Create new portfolio item (admin)
  createItem: async (req, res) => {
    try {
      // Use sanitized data from validation middleware
      const {
        title,
        description,
        project_url,
        technologies,
        category,
        status = 'published',
        featured = false,
      } = req.sanitizedData || req.body;

      console.log('Creating portfolio item with data:', {
        title,
        description: description?.substring(0, 50) + '...',
        project_url,
        technologies,
        category,
        status,
        featured,
        technologiesType: typeof technologies,
        featuredType: typeof featured,
        sanitizedData: !!req.sanitizedData,
        bodyData: !!req.body,
      });

      // Handle image upload
      let image_url = null;
      if (req.file) {
        // Validate file upload
        const fileValidation = validateFileUpload(req.file);
        if (!fileValidation.isValid) {
          return sendResponse(res, 400, false, 'Invalid file upload', {
            errors: fileValidation.errors,
          });
        }
        image_url = `/uploads/images/${req.file.filename}`;
      }

      // Get next display order
      const [orderResult] = await pool.execute(
        'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM portfolio_items'
      );
      const display_order = orderResult[0].next_order;

      // Prepare technologies for database storage
      const technologiesForDB =
        typeof technologies === 'string'
          ? technologies
          : JSON.stringify(technologies);

      // Convert undefined values to null for database
      const dbTitle = title || null;
      const dbDescription = description || null;
      const dbImageUrl = image_url || null;
      const dbProjectUrl = project_url || null;
      const dbTechnologies = technologiesForDB || null;
      const dbCategory = category || null;
      const dbStatus = status || null;
      const dbFeatured = featured !== undefined ? featured : null;

      console.log('Database parameters:', {
        title: dbTitle,
        description: dbDescription,
        image_url: dbImageUrl,
        project_url: dbProjectUrl,
        technologiesForDB: dbTechnologies,
        category: dbCategory,
        display_order,
        status: dbStatus,
        featured: dbFeatured,
      });

      const [result] = await pool.execute(
        'INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order, status, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          dbTitle,
          dbDescription,
          dbImageUrl,
          dbProjectUrl,
          dbTechnologies,
          dbCategory,
          display_order,
          dbStatus,
          dbFeatured,
        ]
      );

      return sendResponse(
        res,
        201,
        true,
        'Portfolio item created successfully',
        { id: result.insertId }
      );
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to create portfolio item');
    }
  },

  // Update portfolio item (admin)
  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      // Use sanitized data from validation middleware
      const {
        title,
        description,
        project_url,
        technologies,
        category,
        status,
        featured,
      } = req.sanitizedData || req.body;

      // Check if item exists
      const [existingItem] = await pool.execute(
        'SELECT image_url FROM portfolio_items WHERE id = ?',
        [id]
      );

      if (existingItem.length === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }

      // Handle image upload
      let image_url = existingItem[0].image_url;
      if (req.file) {
        // Validate file upload
        const fileValidation = validateFileUpload(req.file);
        if (!fileValidation.isValid) {
          return sendResponse(res, 400, false, 'Invalid file upload', {
            errors: fileValidation.errors,
          });
        }
        // Archive old image if it exists
        archiveImage(image_url);
        image_url = `/uploads/images/${req.file.filename}`;
      }

      const [result] = await pool.execute(
        'UPDATE portfolio_items SET title = ?, description = ?, image_url = ?, project_url = ?, technologies = ?, category = ?, status = ?, featured = ?, updated_at = NOW() WHERE id = ?',
        [
          title,
          description,
          image_url,
          project_url,
          JSON.stringify(technologies),
          category,
          status,
          featured,
          id,
        ]
      );

      return sendResponse(
        res,
        200,
        true,
        'Portfolio item updated successfully'
      );
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to update portfolio item');
    }
  },

  // Delete portfolio item (admin)
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;

      // Get image URL before deletion
      const [item] = await pool.execute(
        'SELECT image_url FROM portfolio_items WHERE id = ?',
        [id]
      );

      if (item.length === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }

      // Archive image file if it exists
      archiveImage(item[0].image_url);

      const [result] = await pool.execute(
        'DELETE FROM portfolio_items WHERE id = ?',
        [id]
      );

      return sendResponse(
        res,
        200,
        true,
        'Portfolio item deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      return sendResponse(res, 500, false, 'Failed to delete portfolio item');
    }
  },

  // Reorder portfolio items (admin)
  reorderItems: async (req, res) => {
    try {
      const { items } = req.body; // Array of {id, display_order}

      if (!Array.isArray(items)) {
        return sendResponse(res, 400, false, 'Items array is required');
      }

      // Use transaction for atomic reordering
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        for (const item of items) {
          await connection.execute(
            'UPDATE portfolio_items SET display_order = ? WHERE id = ?',
            [item.display_order, item.id]
          );
        }

        await connection.commit();
        return sendResponse(
          res,
          200,
          true,
          'Portfolio items reordered successfully'
        );
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error reordering items:', error);
      return sendResponse(res, 500, false, 'Failed to reorder items');
    }
  },

  // Toggle featured status (admin)
  toggleFeatured: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'UPDATE portfolio_items SET featured = NOT featured, updated_at = NOW() WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }

      return sendResponse(
        res,
        200,
        true,
        'Featured status toggled successfully'
      );
    } catch (error) {
      console.error('Error toggling featured status:', error);
      return sendResponse(res, 500, false, 'Failed to toggle featured status');
    }
  },

  // Update status (admin)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'published', 'archived'].includes(status)) {
        return sendResponse(res, 400, false, 'Invalid status value');
      }

      const [result] = await pool.execute(
        'UPDATE portfolio_items SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return sendResponse(res, 404, false, 'Portfolio item not found');
      }

      return sendResponse(res, 200, true, 'Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      return sendResponse(res, 500, false, 'Failed to update status');
    }
  },

  // Get archived images (admin)
  getArchivedImages: async (req, res) => {
    try {
      const archivedDir = path.join(__dirname, '../../uploads/archived');

      if (!fs.existsSync(archivedDir)) {
        return sendResponse(res, 200, true, 'No archived images found', []);
      }

      const files = fs.readdirSync(archivedDir);
      const archivedImages = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        })
        .map(file => ({
          filename: file,
          path: `/uploads/archived/${file}`,
          size: fs.statSync(path.join(archivedDir, file)).size,
          created: fs.statSync(path.join(archivedDir, file)).birthtime,
        }))
        .sort((a, b) => b.created - a.created);

      return sendResponse(
        res,
        200,
        true,
        'Archived images retrieved successfully',
        archivedImages
      );
    } catch (error) {
      console.error('Error getting archived images:', error);
      return sendResponse(res, 500, false, 'Failed to get archived images');
    }
  },
};

module.exports = portfolioController;
