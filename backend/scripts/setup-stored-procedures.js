const { pool } = require("../src/config/database");
const fs = require("fs");
const path = require("path");

async function setupStoredProcedures() {
  try {
    console.log("Setting up stored procedures...");

    // Read the stored procedures SQL file
    const sqlFilePath = path.join(
      __dirname,
      "../src/config/stored_procedures.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Split the SQL content by DELIMITER statements
    const statements = sqlContent.split("DELIMITER");

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith("//")) {
        try {
          await pool.execute(statement);
          console.log(`Executed statement ${i + 1}`);
        } catch (error) {
          // Ignore errors for existing procedures
          if (error.code === "ER_SP_ALREADY_EXISTS") {
            console.log(`Procedure already exists, skipping...`);
          } else {
            console.error(`Error executing statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log("Stored procedures setup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up stored procedures:", error);
    process.exit(1);
  }
}

setupStoredProcedures();
