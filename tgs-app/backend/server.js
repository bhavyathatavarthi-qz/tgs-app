const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./src/config');
const governanceRouter = require('./src/routes/governance');
const { warmAllIndexes } = require('./src/vectorStoreManager');
const { GovernanceValidationError } = require('./src/governanceEngine');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TGS Backend', model: config.groqModel });
});

app.use('/api', governanceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof GovernanceValidationError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error('[TGS] Unhandled error:', err);
  res.status(500).json({
    error: 'Governance evaluation failed.',
    detail: err.message || 'Internal server error.',
  });
});

async function start() {
  try {
    console.log('[TGS] Warming vector indexes for all registered companies...');
    await warmAllIndexes();
    console.log('[TGS] Indexes ready.');
  } catch (err) {
    console.error('[TGS] Failed to warm indexes at startup — will build lazily per request.', err);
  }

  app.listen(config.port, () => {
    console.log(`[TGS] Trust & Governance Service listening on http://localhost:${config.port}`);
    console.log(`[TGS] Groq model: ${config.groqModel}`);
    if (!config.groqApiKey) {
      console.warn('[TGS] WARNING: GROQ_API_KEY is not set. Requests to /api/governance will fail until it is configured in .env');
    }
  });
}

start();
