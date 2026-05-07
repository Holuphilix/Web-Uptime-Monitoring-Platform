require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase(maxRetries = 10) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS monitored_urls (
          id SERIAL PRIMARY KEY,
          url TEXT UNIQUE NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS check_results (
          id SERIAL PRIMARY KEY,
          url_id INTEGER REFERENCES monitored_urls(id) ON DELETE CASCADE,
          status VARCHAR(10),
          response_time FLOAT,
          checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        ALTER TABLE monitored_urls
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT FALSE
      `);

      await pool.query(`
        UPDATE monitored_urls
        SET is_active = FALSE
        WHERE is_active IS NULL
      `);

      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.warn(
        `Database initialization attempt ${attempt} failed. Retrying in 3 seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

module.exports = {
  pool,
  initializeDatabase,
};
