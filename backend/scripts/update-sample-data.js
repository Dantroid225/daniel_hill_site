const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

async function updateSampleData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "dh_portfolio",
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log("Updating sample portfolio data...");

    // Update existing sample projects with correct image URLs
    const updateQueries = [
      {
        id: 1,
        title: "Sample Project 1",
        description: "A sample portfolio project description",
        image_url:
          "/uploads/images/image-1753244077780-587641624_optimized.jpg",
        project_url: "https://github.com/sample/project1",
        technologies: JSON.stringify(["React", "Node.js", "MySQL"]),
        category: "Web Development",
        display_order: 1,
        featured: true,
      },
      {
        id: 2,
        title: "Sample Project 2",
        description: "Another sample portfolio project",
        image_url: "/uploads/images/image-1753244077780-587641624.gif",
        project_url: "https://github.com/sample/project2",
        technologies: JSON.stringify(["Vue.js", "Express", "MongoDB"]),
        category: "Full Stack",
        display_order: 2,
        featured: false,
      },
    ];

    for (const project of updateQueries) {
      const [result] = await connection.execute(
        `UPDATE portfolio_items 
         SET title = ?, description = ?, image_url = ?, project_url = ?, 
             technologies = ?, category = ?, display_order = ?, featured = ?
         WHERE id = ?`,
        [
          project.title,
          project.description,
          project.image_url,
          project.project_url,
          project.technologies,
          project.category,
          project.display_order,
          project.featured,
          project.id,
        ]
      );

      if (result.affectedRows > 0) {
        console.log(`Updated project ${project.id}: ${project.title}`);
      } else {
        console.log(`Project ${project.id} not found, creating new entry...`);

        // Insert if not exists
        await connection.execute(
          `INSERT INTO portfolio_items 
           (title, description, image_url, project_url, technologies, category, display_order, featured, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
          [
            project.title,
            project.description,
            project.image_url,
            project.project_url,
            project.technologies,
            project.category,
            project.display_order,
            project.featured,
          ]
        );
        console.log(`Created project: ${project.title}`);
      }
    }

    console.log("Sample data update completed successfully!");
  } catch (error) {
    console.error("Error updating sample data:", error);
  } finally {
    await connection.end();
  }
}

// Run the update
updateSampleData();
