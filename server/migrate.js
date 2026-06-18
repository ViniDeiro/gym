require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

async function run() {
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Running ${file}`);
    await pool.query(sql);
  }

  await pool.end();
  console.log("Database migrated");
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
