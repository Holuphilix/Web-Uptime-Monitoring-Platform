const { initializeDatabase } = require('./src/db');
const { startScheduler } = require('./src/scheduler/scheduler');
const express = require('express');
const monitorRoutes = require('./src/routes/monitorRoutes');
const { register } = require('./src/metrics/metrics');

const app = express();

app.use(express.json());
app.use('/', monitorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
