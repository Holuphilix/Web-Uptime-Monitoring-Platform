const client = require('prom-client');

const register = new client.Registry();
let manualCheckEventTimeout = null;

client.collectDefaultMetrics({ register });

// ✅ Added service label
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of monitoring requests',
  labelNames: ['service', 'status', 'url'],
});

// ✅ Added service label
const failedChecksTotal = new client.Counter({
  name: 'failed_checks_total',
  help: 'Total number of failed uptime checks',
  labelNames: ['service', 'url'],
});

// ✅ Added service label
const responseTimeHistogram = new client.Histogram({
  name: 'response_time_seconds',
  help: 'Response time of monitored URLs',
  labelNames: ['service', 'url', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// ✅ Added service label
const uptimeStatus = new client.Gauge({
  name: 'uptime_status',
  help: 'Current uptime status (1 = up, 0 = down)',
  labelNames: ['service', 'url'],
});

// ⚠️ Leave this unchanged
const manualCheckEvent = new client.Gauge({
  name: 'manual_check_event',
  help: 'Transient event emitted for manual website checks',
  labelNames: ['result', 'url'],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(failedChecksTotal);
register.registerMetric(responseTimeHistogram);
register.registerMetric(uptimeStatus);
register.registerMetric(manualCheckEvent);

function clearManualCheckEvent() {
  manualCheckEvent.reset();

  if (manualCheckEventTimeout) {
    clearTimeout(manualCheckEventTimeout);
    manualCheckEventTimeout = null;
  }
}

function setManualCheckEvent(status, url) {
  clearManualCheckEvent();

  manualCheckEvent.set(
    { result: status === 'UP' ? 'up' : 'down', url },
    1
  );

  manualCheckEventTimeout = setTimeout(() => {
    manualCheckEvent.reset();
    manualCheckEventTimeout = null;
  }, 45000);

  if (typeof manualCheckEventTimeout.unref === 'function') {
    manualCheckEventTimeout.unref();
  }
}

// ✅ Updated to include service
function clearActiveWebsiteStatus(url, service = "uptime-monitor") {
  if (url) {
    uptimeStatus.remove({ service, url });
    return;
  }

  uptimeStatus.reset();
}

// ✅ Updated to include service
function setActiveWebsiteStatus(url, status, service = "uptime-monitor") {
  uptimeStatus.set(
    { service, url },
    status === 'UP' ? 1 : 0
  );
}

module.exports = {
  clearActiveWebsiteStatus,
  clearManualCheckEvent,
  register,
  httpRequestsTotal,
  failedChecksTotal,
  manualCheckEvent,
  responseTimeHistogram,
  setActiveWebsiteStatus,
  setManualCheckEvent,
  uptimeStatus,
};