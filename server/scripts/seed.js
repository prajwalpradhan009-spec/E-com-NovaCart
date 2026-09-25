require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { dbConfig } = require("../db");

async function seed() {
  const connection = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
  try {
    const schema = fs.readFileSync(path.join(__dirname, "..", "..", "database", "schema.sql"), "utf8");
    const data = fs.readFileSync(path.join(__dirname, "..", "..", "database", "seed.sql"), "utf8");
    await connection.query(schema);
    await connection.query(data);
    const [rows] = await connection.query("SELECT COUNT(*) AS count FROM products");
    console.log(`Seeded MySQL novacart with ${rows[0].count} products from database/seed.sql.`);
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
});
