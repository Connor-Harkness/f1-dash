import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initTimescaleDB } from '@f1-dash/timescale';

import { healthHandler } from './handlers/health.js';
import { laptimesHandler } from './handlers/laptimes.js';
import { gapHandler } from './handlers/gap.js';

dotenv.config();

const app = express();
const PORT = process.env.ANALYTICS_ADDRESS || '0.0.0.0:4002';
const [host, port] = PORT.split(':');

// CORS configuration
const origins = process.env.ORIGIN ? process.env.ORIGIN.split(';') : ['http://localhost:3000'];
app.use(cors({
  origin: origins,
  methods: ['GET', 'CONNECT']
}));

app.use(express.json());

// Initialize database connection
let dbPool;
try {
  dbPool = await initTimescaleDB();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Add dbPool to app locals for access in routes
app.locals.dbPool = dbPool;

// Routes
app.get('/api/health', healthHandler);
app.get('/api/laptime/:driverNr', laptimesHandler);
app.get('/api/gap/:driverNr', gapHandler);

app.listen(parseInt(port), host, () => {
  console.log(`Analytics service started on ${host}:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await dbPool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await dbPool.end();
  process.exit(0);
});
