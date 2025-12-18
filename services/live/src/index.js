import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { createManager } from '@f1-dash/client';
import { merge } from '@f1-dash/data';

import { sseHandler } from './handlers/sse.js';
import { driversHandler } from './handlers/drivers.js';
import { healthHandler } from './handlers/health.js';

dotenv.config();

const app = express();
const PORT = process.env.LIVE_ADDRESS || '0.0.0.0:4000';
const [host, port] = PORT.split(':');

// CORS configuration
const origins = process.env.ORIGIN ? process.env.ORIGIN.split(';') : ['http://localhost:3000'];
app.use(cors({
  origin: origins,
  methods: ['GET', 'CONNECT']
}));

// Compression for SSE
app.use(compression({
  filter: (req, res) => {
    if (req.headers['accept'] && req.headers['accept'].includes('text/event-stream')) {
      return true;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json());

// Shared state
const appState = {
  state: {},
  clients: new Set()
};

// Create F1 client manager
const clientManager = createManager();

clientManager.on('message', (message) => {
  if (message.type === 'initial') {
    appState.state = message.data;
    
    // Broadcast initial state to all connected clients
    for (const client of appState.clients) {
      client.sendInitial(message.data);
    }
  } else if (message.type === 'updates') {
    // Merge updates into state
    for (const [category, update] of message.data) {
      if (!appState.state[category]) {
        appState.state[category] = {};
      }
      appState.state[category] = merge(appState.state[category], update);
    }
    
    // Broadcast updates to all connected clients
    const batchedUpdate = {};
    for (const [category, update] of message.data) {
      batchedUpdate[category] = update;
    }
    
    for (const client of appState.clients) {
      client.sendUpdate(batchedUpdate);
    }
  }
});

// Start client manager
clientManager.start().catch(error => {
  console.error('Failed to start client manager:', error);
});

// Routes
app.get('/api/health', healthHandler);
app.get('/api/sse', (req, res) => sseHandler(req, res, appState));
app.get('/api/drivers', (req, res) => driversHandler(req, res, appState));

app.listen(parseInt(port), host, () => {
  console.log(`Live service started on ${host}:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  clientManager.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing connections...');
  clientManager.close();
  process.exit(0);
});
