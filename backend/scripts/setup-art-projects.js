const mysql = require('mysql2/promise');
require('dotenv').config();

const setupArtProjects = async () => {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dh_portfolio',
    });

    console.log('Connected to database successfully');

    // Sample art projects data
    const artProjects = [
      {
        title: 'Digital Abstract Composition',
        description:
          'A vibrant digital artwork exploring color theory and geometric patterns. This piece combines modern digital techniques with classical composition principles.',
        image_url: '/uploads/images/art-abstract.jpg',
        project_url: 'https://artstation.com/abstract-composition',
        technologies: JSON.stringify([
          'Photoshop',
          'Digital Art',
          'Color Theory',
          'Composition',
        ]),
        category: 'art',
        display_order: 1,
        featured: true,
      },
      {
        title: 'Pixel Art Character Design',
        description:
          'A detailed pixel art character created with modern digital techniques. This piece showcases the beauty of limited color palettes and precise pixel placement.',
        image_url: '/uploads/images/art-pixel.jpg',
        project_url: 'https://deviantart.com/pixel-character',
        technologies: JSON.stringify([
          'Aseprite',
          'Pixel Art',
          'Character Design',
          'Animation',
        ]),
        category: 'art',
        display_order: 2,
        featured: false,
      },
      {
        title: '3D Sculpture Study',
        description:
          'A digital 3D sculpture exploring form and texture. This piece demonstrates mastery of digital sculpting tools and understanding of three-dimensional space.',
        image_url: '/uploads/images/art-3d.jpg',
        project_url: 'https://sketchfab.com/3d-sculpture',
        technologies: JSON.stringify([
          'Blender',
          '3D Modeling',
          'Sculpture',
          'Texturing',
        ]),
        category: 'art',
        display_order: 3,
        featured: true,
      },
      {
        title: 'Concept Art Landscape',
        description:
          'A fantasy landscape concept art piece created for game development. This artwork showcases environmental design and atmospheric perspective.',
        image_url: '/uploads/images/art-landscape.jpg',
        project_url: 'https://artstation.com/concept-landscape',
        technologies: JSON.stringify([
          'Procreate',
          'Concept Art',
          'Landscape',
          'Digital Painting',
        ]),
        category: 'art',
        display_order: 4,
        featured: false,
      },
      {
        title: 'Typography Poster Design',
        description:
          'A modern typography poster that explores the relationship between text and visual elements. This piece demonstrates strong design principles and creative typography.',
        image_url: '/uploads/images/art-typography.jpg',
        project_url: 'https://behance.net/typography-poster',
        technologies: JSON.stringify([
          'Illustrator',
          'Typography',
          'Poster Design',
          'Layout',
        ]),
        category: 'art',
        display_order: 5,
        featured: true,
      },
    ];

    // Check if art projects already exist
    const [existingProjects] = await connection.execute(
      'SELECT COUNT(*) as count FROM portfolio_items WHERE category = "art"'
    );

    if (existingProjects[0].count > 0) {
      console.log('Art projects already exist in the database');
      return;
    }

    // Insert art projects
    for (const project of artProjects) {
      await connection.execute(
        'INSERT INTO portfolio_items (title, description, image_url, project_url, technologies, category, display_order, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          project.title,
          project.description,
          project.image_url,
          project.project_url,
          project.technologies,
          project.category,
          project.display_order,
          project.featured,
          'published',
        ]
      );
    }

    console.log('✅ Art projects added successfully!');
    console.log(`Added ${artProjects.length} art projects to the database`);
  } catch (error) {
    console.error('❌ Error setting up art projects:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the setup
setupArtProjects();
