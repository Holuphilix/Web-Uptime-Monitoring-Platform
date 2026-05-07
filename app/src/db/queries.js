const { pool } = require('./index');

// Register or get existing URL
async function getOrCreateUrl(url) {
  const result = await pool.query(
    `INSERT INTO monitored_urls (url)
     VALUES ($1)
     ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
     RETURNING id`,
    [url]
  );

  return result.rows[0].id;
}

// Get all registered URLs (for scheduler)
async function getAllUrls() {
  const result = await pool.query(
    `SELECT id, url FROM monitored_urls`
  );
  return result.rows;
}

// Save monitoring result
async function saveCheckResult(urlId, status, responseTime) {
  await pool.query(
    `INSERT INTO check_results (url_id, status, response_time)
     VALUES ($1, $2, $3)`,
    [urlId, status, responseTime]
  );
}

module.exports = {
  getOrCreateUrl,
  getAllUrls,
  saveCheckResult,
};