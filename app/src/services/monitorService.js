const axios = require('axios');

const {
  httpRequestsTotal,
  failedChecksTotal,
  responseTimeHistogram,
  setActiveWebsiteStatus,
} = require('../metrics/metrics');

const {
  getOrCreateUrl,
  saveCheckResult,
} = require('../db/queries');

async function monitorUrl(url) {
  const urlId = await getOrCreateUrl(url);

  const start = Date.now();
  let status = 'DOWN';

  try {
    await axios.get(url, { timeout: 10000 });
    status = 'UP';
  } catch (error) {
    status = 'DOWN';
  }

  const duration = (Date.now() - start) / 1000;

  const service = "uptime-monitor"; // ✅ single source of truth

  // Metrics
  httpRequestsTotal.inc({
    service,
    url,
    status: status.toLowerCase(),
  });

  responseTimeHistogram.observe(
    {
      service,
      url,
      status: status.toLowerCase(),
    },
    duration
  );

  setActiveWebsiteStatus(url, status, service);

  if (status === 'DOWN') {
    failedChecksTotal.inc({
      service,
      url,
    });
  }

  // Save to DB
  await saveCheckResult(urlId, status, duration);

  return {
    url,
    status,
    responseTime: duration,
  };
}

module.exports = {
  monitorUrl,
};