require("dotenv").config();
const mysql = require("mysql2/promise");

function readNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const dbConfig = Object.freeze({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1",
  port: readNumber("MYSQL_PORT", 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD ?? process.env.DB_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "novacart",
  waitForConnections: true,
  connectionLimit: readNumber("MYSQL_CONNECTION_LIMIT", 10),
  queueLimit: 0,
  charset: "utf8mb4",
  decimalNumbers: true,
  timezone: "Z",
  multipleStatements: false
});

const pool = mysql.createPool(dbConfig);

async function connect() {
  await pool.query("SELECT 1");
  console.log(`✓ MySQL connected · ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      void 0;
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function close() {
  await pool.end();
}

module.exports = { dbConfig, pool, connect, query, withTransaction, close };
