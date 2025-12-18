import dotenv from 'dotenv';
import { createManager } from '@f1-dash/client';
import { merge } from '@f1-dash/data';
import { initTimescaleDB, insertTimingDriver } from '@f1-dash/timescale';

dotenv.config();

console.log('Starting importer service');

// Initialize database
let dbPool;
try {
  dbPool = await initTimescaleDB();
  console.log('Database connection initialized');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Shared state
const state = {};

// Create F1 client manager
const clientManager = createManager();

clientManager.on('message', async (message) => {
  try {
    if (message.type === 'initial') {
      Object.assign(state, message.data);
      console.log('Received initial state');
      
      // Save initial timing data if available
      await saveInitialState(message.data);
    } else if (message.type === 'updates') {
      // Merge updates into state
      for (const [category, update] of message.data) {
        if (!state[category]) {
          state[category] = {};
        }
        state[category] = merge(state[category], update);
      }
      
      // Process and save updates
      await processUpdates(message.data);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});

/**
 * Save initial state to database
 */
async function saveInitialState(data) {
  if (data.timingData && data.timingData.lines) {
    console.log('Saving initial timing data');
    
    for (const [driverNr, driver] of Object.entries(data.timingData.lines)) {
      try {
        await saveTimingDriver(driverNr, driver);
      } catch (error) {
        console.error(`Failed to save initial data for driver ${driverNr}:`, error.message);
      }
    }
  }
}

/**
 * Process and save updates
 */
async function processUpdates(updates) {
  for (const [category, update] of updates) {
    if (category === 'timingData' && update.lines) {
      console.log('Processing timing data update');
      
      for (const [driverNr, driver] of Object.entries(update.lines)) {
        try {
          await saveTimingDriver(driverNr, driver);
        } catch (error) {
          console.error(`Failed to save timing data for driver ${driverNr}:`, error.message);
        }
      }
    }
  }
}

/**
 * Save timing data for a driver
 */
async function saveTimingDriver(driverNr, driverData) {
  const timingDriver = {
    nr: driverNr,
    lap: driverData.numberOfLaps || null,
    gap: parseTimeToMillis(driverData.gapToLeader) || 0,
    leaderGap: parseTimeToMillis(driverData.gapToLeader) || 0,
    laptime: parseTimeToMillis(driverData.lastLapTime?.value) || 0,
    sector1: parseTimeToMillis(driverData.sectors?.[0]?.value) || 0,
    sector2: parseTimeToMillis(driverData.sectors?.[1]?.value) || 0,
    sector3: parseTimeToMillis(driverData.sectors?.[2]?.value) || 0
  };
  
  await insertTimingDriver(dbPool, timingDriver);
}

/**
 * Parse time string to milliseconds
 */
function parseTimeToMillis(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }
  
  // Handle formats like "1:23.456" or "23.456"
  const parts = timeStr.split(':');
  
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return Math.round((minutes * 60 + seconds) * 1000);
  } else {
    const seconds = parseFloat(timeStr) || 0;
    return Math.round(seconds * 1000);
  }
}

// Start client manager
clientManager.start().catch(error => {
  console.error('Failed to start client manager:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  clientManager.close();
  await dbPool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing connections...');
  clientManager.close();
  await dbPool.end();
  process.exit(0);
});
